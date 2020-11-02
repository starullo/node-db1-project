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

accountRouter.get('/', (req, res, next)=>{
    Accounts.getAll()
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.json({message: err.message})
    })
})

accountRouter.get('/:id', (req, res, next)=>{
    Accounts.getById(req.params.id)
    .then(data=>{
        if (data) {
        res.json(data);
        } else {
            res.status(404).json({message: 'No account with the id of ' + req.params.id})
        }
    })
    .catch(err=>{
        res.status(500).json({message: 'Something went wrong'})
    })
})

accountRouter.post('/', (req, res, next)=>{
    if (!req.body.name || !req.body.budget) {
        res.status(400).json({message: "name and budget are required"})
    } else {
        console.log(req.body)
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
    }
})

accountRouter.put('/:id', async (req, res, next)=>{
   const account =  await Accounts.getById(req.params.id);
   if (!account) {
       res.status(404).json({message: 'No account with the id of ' + req.params.id})
   } else if (!req.body.name || !req.body.budget) {
       res.status(400).json({message: 'name and budget are required fields'})
   } else {
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
   }
})

accountRouter.delete('/:id', async (req, res, next)=>{
    try {
        const amountDeleted = await Accounts.delete(req.params.id);
        if (!amountDeleted) {
            res.status(404).json({message: 'no account with the id of ' + req.params.id})
        } else {
            res.json({message: 'account deleted successfully'})
        }
    } catch (error) {
        res.status(500).json({message: 'something went wrong'})
    }
})


module.exports = accountRouter;