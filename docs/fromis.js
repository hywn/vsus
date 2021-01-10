#!/usr/bin/env -S deno run --allow-net --allow-write

import { write, default_group_map_promise } from './util.js'

const namu = await fetch('https://namu.wiki/w/fromis_9/V LIVE')
	.then(r => r.text())

const get_videos =
	text => [...text.matchAll(/vlive.tv\/(video|post)\/([-\d]+).+?>(.+?)<\/a>/g)]
		.map(([, vp, id, title]) => ({ title, url: `https://www.vlive.tv/${vp}/${id}` }))

const lives_urls =
	namu.match(/<span id='\d월_?\d?'>.+?<\/table>/g)
	    .map(get_videos)
	    .flat()
	    .filter(v => !v.title.includes('V PICK!'))
	    .map(({ url }) => url)

write('json/fromis.json')(JSON.stringify(
	(await default_group_map_promise(lives_urls)).filter(x => x)
))