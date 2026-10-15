//const { fetchCharacterByName, fetchSeriesByCharacterId } = require('./marvelService.js');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-character').addEventListener('click', async () => {
        const characterName = document.getElementById('character').value;
        if (!characterName) return alert('Please enter a character name');

        try {
            
            const response = await fetch(`/api/character/${characterName}/series`);
            if (!response.ok) {
                return alert('Character or series not found. Please try again.');
            }

            const data = await response.json();
            const seriesList = data.series;
            const seriesCheckboxes = document.getElementById('series-checkboxes');
            seriesCheckboxes.innerHTML = ''; // Clear previous results

            seriesList.forEach((series) => {
                const thumbnail = series.thumbnail;
                const imageUrl = `${thumbnail.path}/standard_xlarge.${thumbnail.extension}`;
            
                const seriesDiv = document.createElement('div');
                seriesDiv.classList.add('series-item');
                seriesDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${series.title}" width="100px" height="150px"> <!-- Series image -->
                    <div class="series-details">
                        <label for="series-${series.id}" class="series-title">${series.title}</label>
                        <input type="checkbox" id="series-${series.id}" value="${series.id}" data-title="${series.title}">
                    </div>
                `;
            
                seriesCheckboxes.appendChild(seriesDiv); // Append to series-checkboxes
            });

            document.getElementById('series-list').style.display = 'block';
            document.getElementById('subscribe-button').style.display = 'block';
        } catch (error) {
            console.error('Error fetching character or series:', error);
            alert('Error fetching character or series');
        }
    });

    document.getElementById('subscribe-button').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent form submission for now

        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        // Capture selected series
        const selectedSeries = Array.from(document.querySelectorAll('#series-checkboxes input:checked')).map(checkbox => ({
            seriesId: checkbox.value,
            title: checkbox.getAttribute('data-title') // Get the series title from the attribute
        }));
        
        if (selectedSeries.length === 0) return alert('Please select at least one series.');

        const seriesData = [];

        // Loop through each selected series, fetch chapter count, and log to console
        for (let series of selectedSeries) {
            try {
                const response = await fetch(`/api/series/${series.seriesId}/comics`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch comics for series ${series.seriesId}`);
                }
                const data = await response.json();
                seriesData.push({ seriesId: series.seriesId, title: series.title, chapters: data.totalComics });
            } catch (error) {
                console.error('Error fetching comics count:', error);
                alert(`Error fetching comics for series ${series.seriesId}: ${error.message}`);
            }
        }

        // Prepare final user data
        const userData = {
            email,
            phone,
            comicSeries: seriesData
        };

        // Log the final user data to the console
        console.log('User Data:', userData);

        // Send data to backend to store in MongoDB
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
    
            if (response.ok) {
                alert('Subscription successful!');
            } else {
                alert('Failed to subscribe.');
            }
        } catch (error) {
            console.error('Error during subscription:', error);
            alert('Error during subscription.');
        }

    });

   
});
