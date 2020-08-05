/// FETCH VLIVE SUBS
/// main function is `get_video_subs`
/// get_video_subs(videoseq) => some json describing the video's subs
const get_video_info =
	vid_num =>
		fetch(`https://www.vlive.tv/video/${vid_num}`)
			.then(r => r.text())
			.then(t => t.match(/vlive\.video\.init\(.+?\);/s)[0])
			.then(all => [...all.matchAll(/\"(.+?)\"/g)].map(m => m[1]))
			.then(args => ({ master_id: args[5], key: args[6] }))
const get_video_json =
	({ master_id, key }) =>
		fetch(`https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/${master_id}?key=${key}`)
			.then(r => r.json())
const get_video_subs =
	async vid_num =>
		(await get_video_json(await get_video_info(vid_num))).captions

import saving from './saving.js'
import { update } from './um.js'

const group =
	n => array =>
		new Array(Math.ceil(array.length / n)).fill(0)
			.map((_, i) => array.slice(i * n, (i + 1) * n))

const update_subs =
	async channel_code =>
{
	await update(channel_code)

	const { save, loaded: old_videos } = await saving(`${channel_code}.json`, [])

	for (const grp of group(500)(old_videos))
		await Promise.all(
			grp
				.filter(v => !v.subs)
				.map(async v => {
					v.subs = (await get_video_subs(v.videoSeq)) || null

					v.subs ? console.log(`got subs for ${v.videoSeq}!!`)
					       : console.log(`${v.videoSeq} has no subs ):`)
				})
		)

	await save(old_videos)
	return old_videos
}

// gets new videos
// gets new subs
// saves changes to disk
// and returns ALL videos(+subs)
export default update_subs