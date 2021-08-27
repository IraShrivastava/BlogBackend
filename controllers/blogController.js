const express = require('express')
const mongoose = require('mongoose');
const shortid = require('shortid');
//import the libraries
const response = require('./../libs/responseLib');
const time = require('./../libs/timeLib');
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib')
//importing the model here
const BlogModel = mongoose.model('Blog')
//lean() is used to make output as a plain JS
//select('-__v -_id') will hide  __v _id property from result which will be sent to client side
/**
 * function to get all blogs.
 */
let getAllBlog = (req, res) => {
    BlogModel.find()
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'Failed To Find Blog Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Blog Found', 'Blog Controller: getAllBlog')
                let apiResponse = response.generate(true, 'No Blog Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Blog Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}
/**
 * function to read single blog.
 */
let viewByBlogId = (req, res) => {
    console.log(req.user)
    BlogModel.findOne({ 'blogId': req.params.blogId }, (err, result) => {

        if (err) {
            console.log('Error Occured')
            logger.error(`Error Occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            console.log('Blog Not Found')
            let apiResponse = response.generate(true, 'Blog Not Found', 404, null)
            res.send(apiResponse)
        } else {
            logger.info("Blog found successfully", "BlogController:ViewBlogById", 5)
            //console.log('Blog Found Successfully')
            let apiResponse = response.generate(false, 'Blog Found Successfully', 200, result)
            res.send(apiResponse)

        }
    })
}
/*
 * function to read blogs by category.
 */
let viewByCategory = (req, res) => {

    BlogModel.find({ 'category': req.params.category }, (err, result) => {

        if (err) {
            console.log('Error Occured')
            logger.error(`Error Occured: ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            console.log('Blogs Not Found')
            let apiResponse = response.generate(true, 'Blog Not Found', 404, null)
            res.send(apiResponse)
        } else {
            console.log('Blogs Found Successfully')
            let apiResponse = response.generate(false, 'Blogs Found Successfully', 200, result)
            res.send(apiResponse)

        }
    })
}
/**
 * function to read blogs by author.
 */
let viewByAuthor = (req, res) => {

    BlogModel.find({ 'author': req.params.author }, (err, result) => {

        if (err) {
            console.log('Error Occured.')
            logger.error(`Error Occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            console.log('Blogs Not Found')
            let apiResponse = response.generate(true, 'Blog Not Found', 404, null)
            res.send(apiResponse)
        } else {
            console.log('Blogs Found Successfully')
            let apiResponse = response.generate(false, 'Blogs Found Successfully', 200, result)
            res.send(apiResponse)

        }
    })
}
/**
 * function to edit blog by admin.
 */
let editBlog = (req, res) => {

    let options = req.body;
    console.log(options);
    BlogModel.update({ 'blogId': req.params.blogId }, options, { multi: true }).exec((err, result) => {

        if (err) {
            console.log('Error Occured.')
            logger.error(`Error Occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Blog Not Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Blogs Found Successfully', 200, result)
            res.send(apiResponse)

        }
    })
}
/**
 * function to delete the blog.
 */
let deleteBlog = (req, res) => {
    BlogModel.remove({ 'blogId': req.params.blogId }, (err, result) => {
        if (err) {
            console.log('Error Occured.')
            logger.error(`Error Occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            console.log('Blog Not Found.')
            let apiResponse = response.generate(true, 'Blog Not Found', 404, null)
            res.send(apiResponse)
        } else {
            console.log('Blog Deletion Success')
            let apiResponse = response.generate(false, 'Blogs Found Successfully', 200, result)
            res.send(apiResponse)

        }
    })
}
/**
 * function to create the blog.
 */
let createBlog = (req, res) => {
    console.log("inside create blog")
    var today = Date.now()
    let blogId = shortid.generate()

    let newBlog = new BlogModel({

        blogId: blogId,
        title: req.body.title,
        description: req.body.description,
        bodyHtml: req.body.blogBody,
        isPublished: true,
        category: req.body.category,
        author: req.body.fullName,
        created: today,
        lastModified: today
    }) // end new blog model

    let tags = (req.body.tags != undefined && req.body.tags != null && req.body.tags != '') ? req.body.tags.split(',') : []
    newBlog.tags = tags

    newBlog.save((err, result) => {
        if (err) {
            console.log('Error Occured.')
            logger.error(`Error Occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Blogs Created Successfully', 200, result)
            res.send(apiResponse)
        }
    }) // end new blog save
}
/**
 * function to increase views of a blog.
 */
let increaseBlogView = (req, res) => {

    BlogModel.findOne({ 'blogId': req.params.blogId }, (err, result) => {

        if (err) {
            console.log('Error Occured.')
            logger.error(`Error Occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Blog Not Found', 404, null)
            res.send(apiResponse)
        } else {

            result.views += 1;
            result.save(function (err, result) {
                if (err) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured', 500, null)
                    res.send(apiResponse)
                }
                else {
                    let apiResponse = response.generate(false, 'Blogs Updated Successfully', 200, result)
                    res.send(apiResponse)

                }
            });// end result

        }
    })
}

module.exports = {
    getAllBlog: getAllBlog,
    createBlog: createBlog,
    viewByBlogId: viewByBlogId,
    viewByCategory: viewByCategory,
    viewByAuthor: viewByAuthor,
    editBlog: editBlog,
    deleteBlog: deleteBlog,
    increaseBlogView: increaseBlogView

}