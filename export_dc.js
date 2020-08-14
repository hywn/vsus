#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read

const main_page = await fetch('https://namu.wiki/w/드림캐쳐(아이돌)/V LIVE').then(r => r.text())

const years_urls = [...main_page.matchAll(/<span id='\d+년'>.+?<\/span>/g)]
	.map(m => m[0].match(/href='(.+?)'/)[1])
	.map(relative => `https://namu.wiki${relative}`)

const extract_vlive_links = html =>
	Object.fromEntries([...html.matchAll(/vlive.tv\/video\/(\d+)'>(.*?)<\/a>/g)]
		.map(m => [+m[1], m[2].replace(/<.+?>/g, '')]))

const get_links =
	subpage_url =>
		fetch(subpage_url)
			.then(r => r.text())
			.then(extract_vlive_links)

const vlives = (await Promise.all(years_urls.map(get_links)))
	.reduce((all, hash) => ({ ...all, ...hash }))

const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))
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
		<h1><a href="https://vlive.tv/video/${videoSeq}">${title}</a><br />${vlives[videoSeq]}</h1>

		<span>${subs_display}</span>
	`
}
const to_table =
	videos => style + `<table>${videos.map(to_tr).join('')}</table>`

import update_subs from './vsus.js'

const videos = await update_subs('E8D2CB')
//const videos = JSON.parse(new TextDecoder().decode(await Deno.readFile('E8D2CB.json')))

const html = to_table(videos.filter(v => vlives[v.videoSeq]))
write('dc/lives.html')(html)