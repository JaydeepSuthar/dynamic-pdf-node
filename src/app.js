const express = require("express");
const handlebars = require("handlebars");
const { readFile } = require("node:fs/promises");
const puppeteer = require("puppeteer");

const htmlTemplatePath = __dirname + "/pdf_template.html";
const hbsTemplatePath = __dirname + "/template.hbs";

const port = 1337;
const app = express();

const variables = {
	name: "Jaydeep Suthar",
	items: [
		{
			no: 1,
			name: "Jake",
			age: 18,
		},
		{
			no: 2,
			name: "JS",
			age: 22,
		},
		{
			no: 3,
			name: "Jay",
			age: 10,
		},
	],
	price: 950,
};

const compileTemplate = async (data) => {
	const filePath = hbsTemplatePath;

	const htmlString = await readFile(filePath, "utf-8");

	return handlebars.compile(htmlString)(data);
};

/**
 * Generate PDF from HTML
 * @param {string} html
 * @returns {Promise<Buffer>}
 */
const generatePDF = async (html) => {
	const browser = await puppeteer.launch({
		args: ["--no-sandbox"],
		headless: true,
	});
	const page = await browser.newPage();

	await page.setContent(html);

	const pdfOptions = {
		format: "A4",
		printBackground: true,
	};

	const buffer = await page.pdf(pdfOptions);

	await browser.close();

	return buffer;
};

app.get("/", async (req, res) => {
	// res.send({ path: htmlTemplatePath });
	res.sendFile(htmlTemplatePath);
});

app.get("/pdf", async (req, res) => {
	// res.sendFile("./pdf_template.html");

	const compiledHTMLString = await compileTemplate(variables);

	const pdfBuffer = await generatePDF(compiledHTMLString);

	// res.send(compiledHTMLString);
	// res.send({ string: compiledHTMLString });

	res.type("application/pdf");
	res.send(pdfBuffer);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
