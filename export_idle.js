#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net
import update_subs from './vsus.js'
const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

const namu = await fetch('https://namu.wiki/w/(여자)아이들/V LIVE')
	.then(r => r.text())

const get_videos =
	text => [...text.matchAll(/vlive.tv\/video\/(\d+).+?>(.+?)<\/a>/g)]
		.map(([, id, title]) => ({ id: +id, title }))

const lives = Object.fromEntries(
	namu.match(/<span id='\d분기_?\d?'>.+?<\/table>/g)
	    .map(get_videos)
	    .flat()
	    .filter(v => !v.title.includes('V PICK!'))
	    .map(v => [v.id, v])
)

const videos = await update_subs('CE2621')

write('docs/idle.json')(JSON.stringify(
	videos.filter(v => lives[v.videoSeq])
	      .map(v => ({ ...v, namu_title: lives[v.videoSeq].title }))
))