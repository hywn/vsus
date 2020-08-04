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

const style =`<style>img { width: 10em }</style>`
const to_tr =
	({ title, videoSeq, thumbnail, playTime, subs }) =>
{
	const subs_display = subs
		? subs.list.map(v => v.language).join(', ')
		: 'no subs ):'

	return `<tr>
		<td><img src=${thumbnail} /></td>
		<td><a href="https://vlive.tv/video/${videoSeq}">${title}</a></td>
		<td>${subs_display}</td>
	</tr>`
}
const to_table =
	videos => style + `<table>${videos.map(to_tr).join('')}</table>`

const html = to_table(videos.filter(v => lives_ids.includes(v.videoSeq)))
write('idle/lives.html')(html)