const https = require('https');
const DATA_YEAR = '2014';

module.exports = {
    DATA_YEAR: DATA_YEAR,
    FIELDS: {
        general: [
            ('school.name'),
            ('school.state_fips'),
            ('school.degrees_awarded.predominant'),
            ('school.degrees_awarded.highest'),
            ('school.locale'),
            ('school.ownership'),
            (DATA_YEAR + '.student.size')],

        admissions: [
            ('school.name'),
            (DATA_YEAR + '.admissions.admission_rate.overall'),
            (DATA_YEAR + '.student.size'),
            (DATA_YEAR + '.admissions.sat_scores.average.overall'),
            (DATA_YEAR + '.admissions.act_scores.midpoint.cumulative'),
            (DATA_YEAR + '.admissions.sat_scores.midpoint.math'),
            (DATA_YEAR + '.admissions.act_scores.midpoint.math'),
            (DATA_YEAR + '.admissions.sat_scores.midpoint.writing'),
            (DATA_YEAR + '.admissions.act_scores.midpoint.writing'),
            (DATA_YEAR + '.admissions.sat_scores.midpoint.critical_reading'),
            (DATA_YEAR + '.admissions.act_scores.midpoint.english')],

        students: [
            ('school.name'),
            (DATA_YEAR + '.student.size'),
            (DATA_YEAR + '.student.part_time_share'),
            (DATA_YEAR + '.completion.completion_rate_4yr_150nt'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.white'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.black'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.hispanic'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.asian'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.nhpi'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.two_or_more'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.non_resident_alien'),
            (DATA_YEAR + '.student.demographics.race_ethnicity.unknown')],

        financial: [
            ('school.name'),
            (DATA_YEAR + '.cost.avg_net_price.public'),
            (DATA_YEAR + '.cost.avg_net_price.private'),
            (DATA_YEAR + '.aid.median_debt_suppressed.completers.overall'),
            (DATA_YEAR + '.aid.median_debt_suppressed.completers.monthly_payments'),
            ('2012.earnings.10_yrs_after_entry.median')],
    },

    FIPS: {1:'Alabama',2:'Alaska',4:'Arizona',5:'Arkansas',6:'California',8:'Colorado',9:'Connecticut',10:'Delaware',11:'District of Columbia',12:'Florida',13:'Georgia',15:'Hawaii',16:'Idaho',17:'Illinois',18:'Indiana',19:'Iowa',20:'Kansas',21:'Kentucky',22:'Louisiana',23:'Maine',24:'Maryland',25:'Massachusetts',26:'Michigan',27:'Minnesota',28:'Mississippi',29:'Missouri',30:'Montana',31:'Nebraska',32:'Nevada',33:'New Hampshire',34:'New Jersey',35:'New Mexico',36:'New York',37:'North Carolina',38:'North Dakota',39:'Ohio',40:'Oklahoma',41:'Oregon',42:'Pennsylvania',44:'Rhode Island',45:'South Carolina',46:'South Dakota',47:'Tennessee',48:'Texas',49:'Utah',50:'Vermont',51:'Virginia',53:'Washington',54:'West Virginia',55:'Wisconsin',56:'Wyoming',60:'American Samoa',64:'Federated States of Micronesia',66:'Guam',69:'Northern Mariana Islands',70:'Palau',72:'Puerto Rico',78:'Virgin Islands'},
    DEGREES: {0:'nothing',1:'Certificate degrees',2:'Associate degrees',3:'Bachelor\'s degrees',4:'Graduate degrees'},
    LOCALE: {11:'large city',12:'midsize city',13:'small city',21:'large suburb',22:'midsize suburb',23:'small suburb',31:'fringe town',32:'distant town',33:'remote',41:'fringe rural area',42:'distant rural area',43:'remote rural area'},
    OWNERSHIP: {1:'is publically owned',2:'is owned by a private non-profit',3:'is a private for-profit institution'},
    ETHNICITES: {white:'white',black:'black',hispanic:'hispanic',asian:'asian',nhpi:'native Hawaiian or Pacific Islander',two_or_more:'two or more races',non_resident_alien:'non-resident aliens',unknown:'unknown'},

    // Get JSON data from an HTTPS source
    getData: function(url, callback) {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                let parsed = null;

                try {
                    parsed = JSON.parse(data);
                } catch (err) {
                    console.error('err: ', err);
                    console.error('url: ', url);
                }

                callback(parsed);
            });
        }).on('error', (err) => {
            console.error('err: ', err);
            console.error('url: ', url);
            callback(null);
        });
    }
};
