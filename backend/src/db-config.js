// TODO: Rename the filename from TODO-db-config.js to db-config.js
// Paste your MongoDB API key here
const env = process.env.NODE_ENV;
module.exports = {
	// database: (!!env && env.includes('production')) ? 'mongodb+srv://soloviev:qwer1234@quizalharamain.rdgdr.mongodb.net/quiz?retryWrites=true&w=majority' : 'mongodb://localhost/'
	database: 'mongodb+srv://soloviev:qwer1234@quizalharamain.rdgdr.mongodb.net/quiz?retryWrites=true&w=majority'
}
