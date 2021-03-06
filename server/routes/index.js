var express = require('express');
var router = express.Router();
var data = require('../data.js');
var gen = require('../generate.js');
var request = require('request');


router.get('/clientCode', function(req, res, next) {
    var clientCode;
    do {
        clientCode = gen.code(50);
    } while (req.model.isClientCodeUsed(clientCode))
    req.model.clients.push(new data.Client(clientCode));

    res.status(200).json({clientCode: clientCode});
});

router.post('/create', function(req, res, next) {
    if(!req.client) {
        res.status(400).send('Client could not be identified');
        return;
    }
    var voterCode;
    do {
        voterCode = gen.code(5);
    } while (req.model.isPartyCodeUsed(voterCode)) 

    var adminCode;
    do {
        adminCode = gen.code(5);
    } while (req.model.isPartyCodeUsed(adminCode)) 

    var p = new data.Party(voterCode, adminCode);
    req.party = p;
    req.model.parties.push(p);

    p.clients.push(req.client)
    
    p.options = req.body;
    res.status(200).json({
    	adminCode: p.adminCode,
    	voterCode: p.voterCode
	});
    return;
});

router.get('/search', function(req, res, next) {
    request('http://api.deezer.com/search/track?q=' + req.query.q, function(error, response, body) {
        if(error) { res.status(400).end(); }
        else { res.status(response.statusCode).send(body); }
    });
});

module.exports = router;
