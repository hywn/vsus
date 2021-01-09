#!/usr/bin/env -S deno run --allow-net --allow-write

import { info_from_url, inkey_from_info, json_from_info_inkey } from '../vsus.js'

const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

const pack = async url => {
	const info = await info_from_url(url)
	const inkey = await inkey_from_info(info)
	const json = await json_from_info_inkey(info, inkey)

	const { postDetail: { post: { officialVideo } } } = info

	if (json.captions)
		officialVideo.subs = json.captions

	return officialVideo
}

const namu = await fetch('https://namu.wiki/w/(여자)아이들/V LIVE')
	.then(r => r.text())

const get_videos =
	text => [...text.matchAll(/vlive.tv\/(video|post)\/([-\d]+).+?>(.+?)<\/a>/g)]
		.map(([, vp, id, title]) => ({ title, url: `https://www.vlive.tv/${vp}/${id}` }))

const lives =
	namu.match(/<span id='\d분기_?\d?'>.+?<\/table>/g)
	    .map(get_videos)
	    .flat()
	    .filter(v => !v.title.includes('V PICK!'))

write('json/idle.json')(JSON.stringify(
	await Promise.all(lives.map(({ url }) => pack(url)))
))