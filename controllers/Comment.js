const express = require('express');
const router = express.Router();
const { Review } = require('../models'); // Assuming Review is your Sequelize model

// Delete a review
async function deleteComment(req, res){
    const { reviewId } = req.body;
    try {
        const review = await Review.findByPk(reviewId);
        if (review) {
            await review.destroy();
            res.status(200).send({ message: 'Review deleted successfully' });
        } else {
            res.status(404).send({ message: 'Review not found' });
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

async function submitComment(req, res) {
    console.log("USLO JE OVDE")
    try {
        // Provjeri je li korisnik ulogovan
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Morate biti prijavljeni da biste ostavili komentar.' });
        }

        // Podaci o komentaru iz zahtjeva
        const { comment, rating,productId } = req.body;

        // Spremi komentar u bazu podataka
        const newComment = await Review.create({
            UserId: req.user.id, 
            text: comment,
            rating: rating,
            productId
        });

        return res.status(201).json({ success: true, message: 'Komentar je uspješno spremljen.', comment: newComment });
    } catch (error) {
        console.error('Greška prilikom spremanja komentara:', error);
        return res.status(500).json({ success: false, message: 'Došlo je do greške prilikom spremanja komentara.' });
    }
}

module.exports = {submitComment, deleteComment};