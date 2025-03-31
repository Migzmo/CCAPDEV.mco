res.render('restaurant/view', {
    title: restaurant.resto_name,
    restaurant: restaurant,
    reviews: reviews,
    styles: ['/css/restaurant.css'],
    scripts: [
        '/js/restaurant/restaurantView.js',
        '/js/restaurant/addReview.js'
    ],
    layout: 'main'
});