#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net
import saving from './saving.js'

const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))
const { loaded: videos } = await saving('CE2621.json')

const namu = await fetch('https://namu.wiki/w/(여자)아이들/V LIVE')
	.then(r => r.text())
const namu_tables = namu.match(/<span id='\d분기_?\d?'>.+?<\/table>/g)
const get_videos =
	text =>
		[...text.matchAll(/vlive.tv\/video\/(\d+).+?>(.+?)<\/a>/g)]
			.map(([, id, title]) => ({ id: +id, title }))
const lives = namu_tables.map(get_videos).flat()
const lives_ids = lives.filter(v => !v.title.includes('V PICK!')).map(v => v.id)

const style =`<style>
html { display: flex; justify-content: center }
body { display: grid; grid-template-columns: min-content min-content; grid-gap: 0.2em }
img { height: 10em; grid-row-end: span 2; justify-self: center }
h1 { font-size: 2em; width: 16em; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
img, h1, span { border: outset }
</style>`
const to_tr =
	({ title, videoSeq, thumbnail, playTime, subs }) =>
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
const to_table =
	videos => style + `<table>${videos.map(to_tr).join('')}</table>`

const html = to_table(videos.filter(v => lives_ids.includes(v.videoSeq)))
write('idle/lives.html')(html)