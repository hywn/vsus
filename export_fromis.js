#!/usr/bin/env -S deno run --allow-net --allow-write
import update_subs from './vsus.js'
const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

const namu = await fetch('https://namu.wiki/w/fromis_9/V LIVE')
	.then(r => r.text())

const get_videos =
	text => [...text.matchAll(/vlive.tv\/video\/(\d+).+?>(.+?)<\/a>/g)]
		.map(([, id, title]) => ({ id: +id, title: title.trim() }))

const lives = Object.fromEntries(
	namu.match(/<span id='\d월_?\d?'>.+?<\/table>/g)
	    .map(get_videos)
	    .flat()
	    .map(v => [v.id, v])
)

const videos = await update_subs('D5E529')

write('docs/fromis.json')(JSON.stringify(
	videos.filter(v => lives[v.videoSeq])
	      .map(v => ({ ...v, namu_title: lives[v.videoSeq].title }))
))