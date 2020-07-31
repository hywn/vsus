#!/usr/bin/env -S deno run --allow-net

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
	vid_num =>
		get_video_info(vid_num)
			.then(info => get_video_json(info))
			.then(json => json.captions)

console.log(await get_video_subs(195814))
