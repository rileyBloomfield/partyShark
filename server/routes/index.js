var express = require('express');
var router = express.Router();
var data = require('../data.js');
var gen = require('../generate.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/queueStatus', function(req, res, next) {

});

router.get('/clientCode', function(req, res, next) {
    var clientCode;
    do {
        clientCode = gen.code(50);
    } while (req.model.isClientCodeUsed(clientCode))
    req.model.clients = new data.Client(clientCode);

    res.status(200).json({clientCode: clientCode});
});

router.post('/create', function(req, res, next) {
    if(!req.client) {
        res.status(400).send('Client could not be identified');
        return;
    }

    if(!req.party)
    {
        var voterCode;
        do {
            voterCode = gen.code(5);
        } while (req.model.parties.isPartyCodeUsed(voterCode)) 

        var adminCode;
        do {
            adminCode = gen.code(5);
        } while (req.model.parties.isPartyCodeUsed(adminCode)) 

        req.party = new data.Party(voterCode, adminCode);
        req.model.parties.push(req.party);

        req.party.clients.push(req.client)
    }
    
    req.party.options = req.body;
    res.status(200).json(req.party);
    return;
});

router.post('/join', function(req, res, next) {
    if(!req.client) {
        res.status(400).send('Client could not be identified');
        return;
    }

    if(!req.party) {
        res.status(400).send('Party does not exist');
        return;
    }

    req.party.clients.push(req.clients);
    res.status(200).end();
});

router.post('/vote', function(req, res, next) {
    if(!req.client) {
        res.status(400).send('Client could not be identified');
        return;
    }

    if(!req.party) {
        res.status(400).send('Party does not exist');
        return;
    }

    var direction = req.query.direction;
    if(direction != data.Vote.Up || direction != data.Vote.Down) {
        res.status(400).send('Unrecognised vote value');
        return;
    }

    var play = req.party.plays.getPlay(req.query.play)
    if(play == null) {
        res.status(400).send('Unrecognised play');
        return;
    }

    if(!req.client.getVote(play)) {
        play.feedback += direction;
        req.client.votes.push(new data.Vote(play, req.client, direction));
    }

    res.status(200).json({feedback: play.feedback, direction: direction});
    return;
});

router.post('/suggest', function(req, res, next) {

});

router.post('/play', function(req, res, next) {
});

router.post('/veto', function(req, res, next) {
});

module.exports = router;