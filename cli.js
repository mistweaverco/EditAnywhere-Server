#!/usr/bin/env node

const port = 6789;
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const yargs = require("yargs");
const app = express();

let VERBOSE_MODE = false;
const DATA = new Map();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const argv = yargs.argv;

if (argv.version) {
	console.log(process.env.npm_package_version);
	process.exit(0);
}
if (argv.v || argv.verbose) VERBOSE_MODE = true;

const getTimestamp = () => Math.floor(Date.now() / 1000);

app.get("/", (_, res) => {
	res.json(Array.from(DATA.keys()));
});

app.get("/:app", (req, res) => {
	if (!DATA.get(req.params.app)) {
		return res.json({
			success: false,
			code: 404
		});
	}

	res.json(Array.from(DATA.get(req.params.app).keys()));
});

app.get("/:app/:id", (req, res) => {
	if (!DATA.get(req.params.app)) {
		return res.json({
			success: false,
			code: 404
		});
	}
	if (!DATA.get(req.params.app).get(req.params.id)) {
		return res.json({
			success: false,
			code: 404
		});
	}
	res.json(DATA.get(req.params.app).get(req.params.id));
});

app.post("/:app/:id", (req, res) => {
	if (!DATA.get(req.params.app)) {
		DATA.set(req.params.app, new Map());
	}
	if (req.body.flush) {
		DATA.get(req.params.app).delete(req.params.id);

		if (VERBOSE_MODE) {
			console.log(`Flushed ${req.params.app}/${req.params.id}`);
		}

		res.json({ success: true });
		return;
	}
	DATA.get(req.params.app).set(req.params.id, {
		file_extension: req.body.file_extension,
		content: req.body.content,
		timestamp: getTimestamp()
	});

	if (VERBOSE_MODE) {
		console.log("Received data");
		console.log(req.body);
	}

	res.json({ success: true });
});

app.listen(port, () => {
	if (VERBOSE_MODE)
		console.log(`EditAnywhere Server listening at http://127.0.0.1:${port}`);
});
