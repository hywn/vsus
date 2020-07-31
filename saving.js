import { readJson } from 'https://deno.land/std/fs/read_json.ts'
import { writeJson } from 'https://deno.land/std/fs/write_json.ts'

const saving =
	async (path, defaul) => ({
		save: obj => writeJson(path, obj),
		loaded: await readJson(path).catch(e => undefined) || defaul
	})

export default saving