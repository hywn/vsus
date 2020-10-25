#!/usr/bin/env -S deno run --allow-net --allow-write

import update_subs from './vsus.js'

const namu = await fetch('https://namu.wiki/w/오마이걸/V LIVE')
	.then(r => r.text())

const namu_tables = namu.match(/<span id='\d분기_?\d?'>.+?<\/table>/g)

const get_videos =
	text => [...text.matchAll(/vlive.tv\/video\/(\d+).+?>(.+?)<\/a>/g)]
		.map(([, id, title]) => ({ id: +id, title }))

const lives = namu_tables
	.map(get_videos)
	.flat()
	.filter(v => !v.title.includes('V PICK!'))

const videos = await update_subs('F51143')

const style =`<style>
html { display: flex; justify-content: center }
body { display: grid; grid-template-columns: min-content min-content; grid-gap: 0.2em }
img { height: 10em; grid-row-end: span 2; justify-self: center }
h1 { font-size: 2em; width: 16em; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
img, h1, span { border: outset }
</style>`
const to_tr =
	({ title, videoSeq, thumbnail, subs }) =>
{
	const subs_display = subs
		? subs.list.map(v => v.language).join(', ')
		: 'no subs ):'

	return `
		<img src=${thumbnail} />
		<h1><a href="https://vlive.tv/video/${videoSeq}">${title}</a><br />${lives.find(v => v.id === videoSeq).title}</h1>

		<span>${subs_display}</span>
	`
}

const to_table = videos => style + `<table>${videos.map(to_tr).join('')}</table>`

const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

const LIVE_IDS = new Set(lives.map(v => v.id))

write('docs/omg.html')(to_table(videos.filter(v => LIVE_IDS.has(v.videoSeq))))

console.log(LIVE_IDS)