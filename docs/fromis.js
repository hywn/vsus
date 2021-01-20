#!/usr/bin/env -S deno run --allow-net --allow-write

import { write, pack, group_map_promise } from './util.js'

// get fromis vlive namumark
const namumark = await fetch('https://namu.wiki/edit/fromis_9/V LIVE')
	.then(r => r.text())
	.then(text =>
		text.match(/<textarea name="text".+?>(.+?)<\/textarea>/s)[1]
		    .replaceAll('&lt;', '<')
		    .replaceAll('&gt;', '>')
	)

/*
   spaghetti code for parsing namumark tables into
   rows that start, end, and are separated by '||'
                                                   */

let table_lines = []

let temp = null
for (const line of namumark.split('\n')) {
	if (temp != null) {
		temp += line
		if (line.endsWith('||')) {
			table_lines.push(temp)
			temp = null
		}
	} else {
		if (!line.startsWith('||')) continue
		if (line.startsWith('||<-4>')) continue
		if (line.startsWith('||<rowbgcolor')) continue
		if (line.endsWith('||'))
			table_lines.push(line)
		else
			temp = line + '\n'
	}
}

/*
   turn rows into 2d array (table)
   regularises rowspans (not colspans)
                                       */

// queues would make sense? but also dont make a great deal of sense
// i think? because only copies of one thing can even be in the stack/queue at the same time
// (impossible for diff things) to be in it
// because if something is in there
// nothing will be added to it in the first place
// except something like <|2> <|2> will mess it up maybe?
const extended = [[], [], [], []]

const table = table_lines.map(line => {
	const a = line.split('||')
	const got = a.slice(1, a.length - 1).reverse()
	const cols = extended.map(s => {
		// if it popped from s, should it refuse to push to it also?
		const col = s.length ? s.pop() : got.pop()
		if (!col) console.error(line)
		const maybe = col.match(/<\|(\d)>(.+)/)
		if (!maybe) return col
		const [_, n, rest] = maybe
		s.push(...new Array(n - 1).fill(rest))
		return rest
	})
	if (cols.some(x => x == null))
		throw `col messed up. line ${line}`
	return cols
})

/*
   extract info from table
                           */

const ALL = ['백지헌', '이나경', '이채영', '이서연', '노지선', '박지원', '장규리', '송하영', '이새롬']

const processed = table.map(row => {

	const members_search = row[2].match(/백지헌|이나경|이채영|이서연|노지선|박지원|장규리|송하영|이새롬|전원/g)
	const tags = new Set(members_search)

	if (tags.has('전원')) {
		ALL.forEach(m => tags.add(m))

		if (members_search[0] !== '전원') // 제외
			members_search.forEach(m => tags.delete(m))
	}

	if (row[3].match(/voice only/i)) tags.add('voice only')

	const urls = row[1].match(/http.+?\/(?:post|video)\/[\d-]+/g)

	if (!urls)
		throw `no urls: ${JSON.stringify(row)}`

	return urls.map(url => ({ url, tags: [...tags] }))
}).flat()

/*
   use vsus to get video infos
   and save json to file
                               */

const my_pack = async ({ url, tags }) => {
	const info = await pack(url)
	delete info.recommendedVideos
	info.tags = tags
	if (info.title.includes('FM_1.24')) info.tags.push('FM_1.24')
	if (info.subs)
	info.tags.push('subs')

	return info
}

write('json/fromis.json')(JSON.stringify(
	await group_map_promise(250)(my_pack)(processed)
))