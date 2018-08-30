/* eslint-disable no-console */

require('dotenv').config()
const shush = require('shush')
const { languages } = shush('./languages.json')
const { cleanUp, cloneRepo, getCommits, getAllLangueges } = require('./utils')


languages.forEach(async (language) => {
	try{
		await getCommits(language)
	}catch(err){
		console.err(err)
	}
})


// Only call to get the first setup 

function init() {
	cleanUp()
	languages.forEach(language => {
		console.log(`Fetching - ${language.name}...`)
		cloneRepo(language, () => console.log(`Done - ${language.name} 👍🏻`))
	})
}

// init()

// Promise.all(languages.map(language => getAllLangueges(language.user, language.repoName)))
// 	.then(res => {
// 		const list = res.reduce((acc, val) => ({ ...acc, ...val }), {})
// 		console.log(
// 			Object.keys(list)
// 				.sort(function (a, b) { return list[b] - list[a] })
// 		)
// 	}) 
