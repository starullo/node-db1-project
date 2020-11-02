const express = require('express');

const db = require('../data/dbConfig');

const accountRouter = express.Router();

const Accounts = {
    getAll() {
        return db('accounts');
    },
    getById(id) {
        return db('accounts').where({id}).first();
    },
    createAccount(account) {
        return db('accounts').insert(account);
    },
    updateAccount(id, account) {
        return db('accounts').where({id}).update(account);
    },
    delete(id) {
        return db('accounts').where({id}).del()
    }
}

const validateAccountId = (req, res, next) => {
    Accounts.getById(req.params.id)
    .then(data=>{
        if (data) {
            req.accountInfo = data;
            next();
        } else {
            next({code: 404, message: 'there is no account with the id of ' + req.params.id + '!'})
        }
    })
    .catch(err=>{
        next({code: 500, message: 'something went wrong'})
    })
}

const validateNewAccount = (req, res, next) => {
    if (req.body.name && req.body.budget) {
        req.newAccount = req.body;
        next();
    } else {
        next({code: 404, message: ''})
    }
}

accountRouter.get('/', (req, res, next)=>{
    Accounts.getAll()
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.json({message: err.message})
    })
})

accountRouter.get('/:id', validateAccountId, (req, res, next)=>{
    res.json(req.accountInfo);
})

accountRouter.post('/', validateNewAccount, (req, res, next)=>{
        Accounts.createAccount(req.body)
        .then(([id])=>{
            console.log(id)
            return Accounts.getById(id)
        })
        .then(data=>{
            res.status(201).json(data)
        })
        .catch(err=>{
            res.status(500).json({message: 'Something went wrong'})
        })
})

accountRouter.put('/:id', [validateAccountId, validateNewAccount], async (req, res, next)=>{
       Accounts.updateAccount(req.params.id, req.body)
       .then(async data=>{
           const newAccount = await Accounts.getById(req.params.id);
           return newAccount;
       })
       .then(data=>{
           res.status(200).json(data);
       })
       .catch(err=>{
           res.status(500).json({message: 'something went wrong'})
       })
})

accountRouter.delete('/:id', validateAccountId, async (req, res, next)=>{
            Accounts.delete(req.params.id)
            .then(data=>{
                res.json({message: 'account deleted successfully'})
            })
            .catch(err=>{
                res.status(500).json({message: 'something went wrong'})
            }
            )
})

accountRouter.use((err, req, res, next)=>{
    res.status(err.code).json({message: err.message})
})

module.exports = accountRouter;