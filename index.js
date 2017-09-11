'use strict';

const Alexa = require('alexa-sdk');

const API_KEY = process.env.API_KEY;

const helpers = require('./helpers.js');
const DATA_YEAR = helpers.DATA_YEAR;

const handlers = {
	'LaunchRequest': function() {
		let speech = 'U.S. Universities can get you U.S. university statistics. It can also dive deeper into university admissions, students and financial data. ';

		if (this.event.request.locale == 'en-US') {
			speech = 'College Scorecard can get you college information. It can also dive deeper into college admissions, students and financial data. ';
		}

		speech += 'What would you like to do?';
		let followup = 'What would you like to do? As an example, you could ask to lookup Harvard University';

		this.emit(':ask', speech, followup);
	},
	'LookupGeneral': function() {
		this.emit('Lookup', 'general');
	},
	'LookupAdmissions': function() {
		this.emit('Lookup', 'admissions');
	},
	'LookupStudents': function() {
		this.emit('Lookup', 'students');
	},
	'LookupFinancial': function() {
		this.emit('Lookup', 'financial');
	},
	'Lookup': function(fields = 'general') {
		let college_name = this.event.request.intent.slots.college_name.value || this.attributes.college_name || null;

		if (!college_name) {
			let speech = [
				'<say-as interpret-as="interjection">okey dokey</say-as> ',
				'<say-as interpret-as="interjection">uh huh</say-as> ',
				'<say-as interpret-as="interjection">you bet</say-as> ',
				'Sure. '
			][Math.floor(Math.random()*4)];

			let speech_followup;

			if (this.event.request.locale == 'en-US') {
				speech = 'What college?';
				speech_followup = 'What college would you like information about?';
			} else {
				speech += 'What university?';
				speech_followup = 'What U.S. university would you like information about?';
			}

			this.emit(':elicitSlot', 'college_name', speech, speech_followup);
		} else {
			// Catch common test cases
			if (college_name == 'MIT') {
				college_name = 'Massachusetts Institute of Technology';
			} else if (college_name == 'Caltech') {
				college_name = 'California Institute of Technology';
			}

			let url = 'https://api.data.gov/ed/collegescorecard/v1/schools?api_key=' + API_KEY + '&school.name=' + college_name + '&fields=' + helpers.FIELDS[fields].join();

			helpers.getData(url, (college_data) => {
				if (!(college_data.results && college_data.results[0] && college_data.results[0]['school.name'])) {
                    this.emit(':tell', 'I couldn\'t find information for ' + college_name + '.');
				} else {
					this.attributes.college_name = college_name;

					var c = function (i) {
						return college_data.results[0][helpers.FIELDS[fields][i]];
					};

					let speech = 'I couldn\'t find ' + c(0) + '. ';
					let cardText = speech;
					let cardTitle = c(0);
					let speech_followup = 'Would you like admissions, student or financial information for ' + c(0) + '?';

					switch (fields) {
						case 'general':
							speech = c(0) + ' in ' +
								helpers.FIPS[c(1)] +
								((c(2)) ? (' mainly awards ' + helpers.DEGREES[c(2)] +
									((c(3) > c(2)) ? (' but awards up to ' + helpers.DEGREES[c(3)] + '. ') : (', which are the highest degrees they offer. '))) : ' does not award degrees. ') +
								'It ' + ((c(4)) ? ('is based in a ' + helpers.LOCALE[c(4)] + ', ') : '') +
								((c(5)) ? (helpers.OWNERSHIP[c(5)] + ', and ') : '') +
								((c(6)) ? ('had ' + c(6) + ' students enrolled in ' + DATA_YEAR) : '') +
								'. ';
                            cardText = speech;
							break;
						case 'admissions':
							speech = c(0) + ' had an acceptance rate of ' +
								Math.round(c(1) * 1000) / 10 + '% in ' + DATA_YEAR + '. ' +
								((c(3) && c(4) && c(5) && c(6) && c(7) && c(8) && c(9) && c(10)) ? (
									((c(3) > 1250) ? '<say-as interpret-as="interjection">crikey</say-as>, ' : '') +
									'The ' + c(2) + ' students at there in ' + DATA_YEAR + ' had a average SAT score of ' + c(3) +
									' and an average cumulative ACT score of ' + c(4) + '. ' +
									'Average SAT and ACT scores were as follows: ' +
									'Mathematics: ' + c(5) + ', ' + c(6) +
									'. Writing: ' + c(7) + ', ' + c(8) +
									'. SAT Critical reading ' + c(9) + ', and ACT English ' + c(10) + '. ') : '');
                            cardText = speech;
                            speech_followup = 'Would you like general, student or financial information for ' + c(0) + '?';
							break;
						case 'students':
							var ethnicities = [],
								prop;
							for (prop in college_data.results[0]) {
								if (prop.indexOf('race_ethnicity') !== -1 && college_data.results[0].hasOwnProperty(prop)) {
									ethnicities.push({
										'k': prop.split('.').pop(),
										'v': Math.round(college_data.results[0][prop] * 1000) / 10
									});
								}
							}
							ethnicities.sort(function(a, b) {
								return b.v - a.v;
							});

							speech = c(0) + ' had ' + c(1) + ' students enrolled in ' + DATA_YEAR +
								', of whom ' + Math.round(c(2) * 1000) / 10 + '% were part time. ' +
								c(0) + ' has a completion rate of ' + Math.round(c(3) * 1000) / 10 + '%' +
								((ethnicities[0] && ethnicities[1] && ethnicities[2]) ? (
									', and its student body is ' +
									ethnicities[0].v + '% ' + helpers.ETHNICITES[ethnicities[0].k] + ', ' +
									ethnicities[1].v + '% ' + helpers.ETHNICITES[ethnicities[1].k] + ', and ' +
									ethnicities[2].v + '% ' + helpers.ETHNICITES[ethnicities[2].k] + '. '
								) : ('. '));
                            cardText = speech;
							speech_followup = 'Would you like general, admissions or financial information for ' + c(0) + '?';
							break;
						case 'financial':
							speech = c(0) + ' costs an average of $' + (c(1) || c(2)).toLocaleString() + ' per year to attend, ' +
								'meaning undergraduate borrowers have an average debt of $' + c(3).toLocaleString() + ', which equates to monthly payments of $' + c(4).toFixed(2) + '. ' +
								'However, ' + c(0) + ' graduates earn on average $' + c(5).toLocaleString() + ' 10 years after entering the school. ';
							cardText = speech;
							speech_followup = 'Would you like general, admissions or student information for ' + c(0) + '?';
							break;
						default:
							speech_followup = 'What should I do instead?';
					}

					speech += speech_followup;

					this.emit(':askWithCard', speech, speech_followup, cardTitle, cardText);
				}
			});
		}
	},
	'AMAZON.HelpIntent': function() {
		this.emit('LaunchRequest');
	},
	'AMAZON.CancelIntent': function() {
		this.emit('StopIntent');
	},
	'AMAZON.StopIntent': function() {
		// ~0.5% chance of making user consider if they are going insane
		let speech = (Math.random() > 0.005 ? '<say-as interpret-as="interjection">cheerio</say-as>' : '<say-as interpret-as="interjection">bada bing bada boom</say-as> <say-as interpret-as="interjection">au revoir</say-as>');

		this.emit(':tell', speech);
	},
	'Unhandled': function() {
		this.emit(':ask', 'Sorry, I didn\'t get that. Please can you repeat it?', 'Sorry, what was that?');
	}
};

exports.handler = function(event, context) {
	const alexa = Alexa.handler(event, context);
	alexa.appId = process.env.APP_ID;
	alexa.registerHandlers(handlers);
	alexa.execute();
};
