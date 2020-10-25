#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net
import update_subs from './vsus.js'
const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

const namu = await fetch('https://namu.wiki/w/우주소녀/V LIVE')
	.then(r => r.text())

const get_videos =
	text => [...text.matchAll(/vlive.tv\/video\/(\d+).+?>(.+?)<\/a>/g)]
		.map(([, id, title]) => ({ id: +id, title }))

const lives = Object.fromEntries(
	namu.match(/2\.\d\.<\/a>.+?\d{4}년.+?<\/table>/g)
	    .map(get_videos)
	    .flat()
	    .map(v => [v.id, v])
)

const videos = await update_subs('F5F127')

write('docs/wjsn.json')(JSON.stringify(
	videos.filter(v => lives[v.videoSeq])
	      .map(v => ({ ...v, namu_title: lives[v.videoSeq].title }))
))