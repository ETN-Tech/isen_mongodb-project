const express = require('express')
const router = express();

router.get('/lille', (req, res) => {
    let data;

    // TODO request data from VLille API

    res.status(200).json(data);
})


module.exports = router
