/******************************************************/
/** fetching subs for single video with its videoSeq **/
/******************************************************/

// videoSeq => { master_id, key }
const get_video_info =
	vid_num =>
		fetch(`https://www.vlive.tv/video/${vid_num}`)
			.then(r => r.text())
			.then(t => t.match(/vlive\.video\.init\(.+?\);/s)[0])
			.then(all => [...all.matchAll(/\"(.+?)\"/g)].map(m => m[1]))
			.then(args => ({ master_id: args[5], key: args[6] }))

// { master_id, key } => { video json!!! }
const get_video_json =
	({ master_id, key }) =>
		fetch(`https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/${master_id}?key=${key}`)
			.then(r => r.json())

// videoSeq => { video json!!! }
const get_video_subs =
	async vid_num =>
		(await get_video_json(await get_video_info(vid_num))).captions

/***********************************/
/** fetching all videos (no subs) **/
/***********************************/

// channelCode => channelSeq
const channel_seq =
	code =>
{
	const half = Math.ceil(code.length / 2)
	const shuf = code.substring(half, code.length) + code.substring(0, half)
	return (parseInt(shuf, 16) + 13) / 8191
}

// channelSeq => pageSize => pageNo => [video jsons!!!]
const get =
	seq => page_size => page =>
		fetch(`https://api-vfan.vlive.tv/vproxy/channelplus/getChannelVideoList?app_id=8c6cc7b45d2568fb668be6e05b6e5a3b&channelSeq=${seq}&maxNumOfRows=${page_size}&pageNo=${page}`)
			.then(r => r.json())

// channelCode => [video jsons!!!]
const get_videos =
	async (code, limit=false, page_size=100) =>
{
	const getvids = get(channel_seq(code))

	const num_videos = limit || (await getvids(1)(1)).result.totalVideoCount

	const page_nums = new Array(Math.ceil(num_videos / page_size)).fill(0).map((_, i) => i + 1)

	return (await Promise.all(page_nums.map(getvids(page_size))))
		.map(r => r.result.videoList)
		.flat()
}

/**********/
/** util **/
/**********/

// 3 => [1, 2, 3, 4, 5, 6, 7] => [[1, 2, 3], [4, 5, 6], [7]]
const group = n => array => new Array(Math.ceil(array.length / n)).fill(0).map((_, i) => array.slice(i * n, (i + 1) * n))

// resolve after millis ms
const wait = millis => new Promise((res) => setTimeout(res, millis))

/*****************/
/** actual code **/
/*****************/

// channelCode => [video jsons augmented with .subs]
const update_subs =
	async (channel_code, limit=false) =>
{
	// fetch all videos from VLIVE
	console.log('fetching videos...')
	const videos = await get_videos(channel_code, limit)
	console.log(`got ${videos.length} videos`)

	// wait for a bit
	// naver tends to be unpredictably uncooperative
	// waiting maybe helps ??
	if (!limit)
		await wait(2500)

	// fetch all subs from VLIVE and store in videos
	for (const grp of group(500)(videos))
		await Promise.all(
			grp
				.filter(v => !v.subs)
				.map(async v => {
					v.subs = (await get_video_subs(v.videoSeq)) || null

					v.subs ? console.log(`got subs for ${v.videoSeq}!!`)
					       : console.log(`${v.videoSeq} has no subs ):`)
				})
		)

	return videos
}

export default update_subs