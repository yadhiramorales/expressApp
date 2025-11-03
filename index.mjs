import express from 'express';
import axios from 'axios';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//routes
app.get('/', (req, res) => {
   res.render('home.ejs');
});

app.get('/about', (req, res) => {
   res.render('about.ejs');
});

app.get('/searchArtistInfo', async (req, res) => {
    let artistName = req.query.artist;
    let apiUrl = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(artistName)}&fmt=json`;
    const response = await axios.get(apiUrl);
    const allArtists = response.data.artists.slice(0, 10); //limiting for simpler display
    console.log(allArtists);

    let sorted = allArtists.sort((a, b) => b.score - a.score); //sorts artists by matching score
    //gettting best match
    let bestMatch = sorted.find(a => 
    a.name.toLowerCase() === artistName.toLowerCase() ||
    a.aliases?.some(alias => alias.name.toLowerCase() === artistName.toLowerCase())
    ) || sorted[0];
    console.log(bestMatch);
    let artists = [bestMatch];
    res.render('artist.ejs', {artists});
});

app.get('/allArtistAlbums', async (req, res) => {
    let artistName = req.query.artist;
    let apiUrl = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(artistName)}&fmt=json`;
    const response = await axios.get(apiUrl);
    const allArtists = response.data.artists.slice(0, 10); //limiting for simpler display
    console.log(allArtists);

    let sorted = allArtists.sort((a, b) => b.score - a.score); //sorts artists by matching score
    //gettting best match
    let bestMatch = sorted.find(a => 
    a.name.toLowerCase() === artistName.toLowerCase() ||
    a.aliases?.some(alias => alias.name.toLowerCase() === artistName.toLowerCase())
    ) || sorted[0];
    console.log(bestMatch);
    //in the case that we don't actually get a best match
    if (!bestMatch) return res.render('artistAlbums.ejs', { artist: null, albums: [] });
    //release groups api url
    let rgUrl = `https://musicbrainz.org/ws/2/release-group?artist=${bestMatch.id}&type=album&fmt=json`;
    const rgResponse = await axios.get(rgUrl);
    const albums = [];
    const groups = rgResponse.data['release-groups'] || [];
    for (const group of groups) {
        albums.push({
        title: group.title,
        firstReleaseDate: group['first-release-date'] || 'N/A',
        });
    }
    console.log(albums);

    res.render('artistAlbums.ejs', { artist: bestMatch, albums });
});


app.get('/searchAlbum', async (req, res) => {
    let albumTitle = req.query.album;
    let apiUrl = `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(albumTitle)}&fmt=json`;
    const response = await axios.get(apiUrl);
    const albums = (response.data['release-groups'] || [])
        .filter(a => a.title?.toLowerCase() === albumTitle.toLowerCase()) //EXACT title matches
        .slice(0, 10); //also limiting for cleaner display (up to 10)
    
    console.log(albums);
    res.render('album.ejs', {albums});
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})