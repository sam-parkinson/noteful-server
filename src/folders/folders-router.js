const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const scrubFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name),
});

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(
      req.app.get('db')
    )
      .then(folders => {
        res.json(folders.map(scrubFolder));
      })
      .catch(next);
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(scrubFolder(res.folder))
  })

module.exports = foldersRouter;