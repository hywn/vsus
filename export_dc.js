#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read
import update_subs from './vsus.js'
const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

const main_page = await fetch('https://namu.wiki/w/드림캐쳐(아이돌)/V LIVE').then(r => r.text())

const years_urls = [...main_page.matchAll(/<span id='\d+년'>.+?<\/span>/g)]
	.map(m => m[0].match(/href='(.+?)'/)[1])
	.map(relative => `https://namu.wiki${relative}`)

const extract_vlive_links = html =>
	Object.fromEntries([...html.matchAll(/vlive.tv\/video\/(\d+)'>(.*?)<\/a>/g)]
		.map(m => [+m[1], { title: m[2].replace(/<.+?>/g, '') }]))

const get_links =
	subpage_url =>
		fetch(subpage_url)
			.then(r => r.text())
			.then(extract_vlive_links)

const lives = (await Promise.all(years_urls.map(get_links)))
	.reduce((all, hash) => ({ ...all, ...hash }))

const videos = await update_subs('E8D2CB')

write('docs/dc.json')(JSON.stringify(
	videos.filter(v => lives[v.videoSeq])
	      .map(v => ({ ...v, namu_title: lives[v.videoSeq].title }))
))