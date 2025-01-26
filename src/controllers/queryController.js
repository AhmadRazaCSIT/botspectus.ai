const { queryService } = require('../services/queryService');
const { refineQuery } = require('../../utils/refinementsAiService');

module.exports.query = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query field is required' });
        }
        console.log('query:', { query });
        const queryResult = await queryService(query);
        if (!queryResult) {
            res.status(404).json({ message: 'No matching value found.' });
        } else {
            const RefineQuery = await refineQuery(query, queryResult);
            res.status(200).json({ RefineQuery });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};