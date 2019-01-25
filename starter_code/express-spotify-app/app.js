const express = require('express');
const path = require('path')
const app = express();
const hbs = require('hbs');
const bodyParser = require('body-parser');

const SpotifyWebApi = require('spotify-web-api-node');

// Remember to paste your credentials here
const clientId = '334d0ae7ae0d4ac897b24f6377d269b9',
      clientSecret = 'dc0ba8b602a64e7792be329eefab8b4b';

const spotifyApi = new SpotifyWebApi({
    clientId : clientId,
    clientSecret : clientSecret
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant()
    .then(function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
    console.log('Something went wrong when retrieving an access token', err);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials');

app.get('/', function (req, res) {
    res.render('index');
})

app.get('/artists', function (req, res) {
    const query = req.query.q;

    spotifyApi.searchArtists(query)
        .then(data => {
            const artistsRaw = data.body.artists.items;

            const artists = artistsRaw.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    image: (item.images[0]) ? item.images[0].url : ''
                }
            });

            res.render('artists', { artists });
        })
        .catch(err => {
            console.log(`searchArtists Error: ${err}`);
        });
})

app.get('/albums/:artistId', (req, res) => {
    const artistId = req.params.artistId;

    spotifyApi.getArtistAlbums(artistId)
        .then(data => {
            const albumsRaw = data.body.items;

            const albums = albumsRaw.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    image: (item.images[0]) ? item.images[0].url : ''
                }
            });

            res.render('albums', { albums });
        })
        .catch(err => {
            console.log(`getArtistAlbums Error: ${err}`);
        });
});

app.listen(3000, () => console.log('App listening on port 3000!'))
