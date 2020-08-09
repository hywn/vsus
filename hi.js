const channel_seq =
	code => {
		const half = Math.ceil(code.length / 2)
		const shuf = code.substring(half, code.length) + code.substring(0, half);
		return (parseInt(shuf, 16) + 13) / 8191
	}

const get =
	seq => page_size => page =>
		fetch(`https://api-vfan.vlive.tv/vproxy/channelplus/getChannelVideoList?app_id=8c6cc7b45d2568fb668be6e05b6e5a3b&channelSeq=${seq}&maxNumOfRows=${page_size}&pageNo=${page}`)
			.then(r => r.json())

const get_videos =
	async (code, page_size=100) =>
{
	const getvids = get(channel_seq(code))

	const num_videos = (await getvids(1)(1)).result.totalVideoCount

	const page_nums = new Array(Math.ceil(num_videos / page_size)).fill(0).map((_, i) => i + 1)

	const results = await Promise.all(page_nums.map(getvids(page_size)))

	return results
		.map(r => r.result.videoList)
		.flat()
}

export default get_videos