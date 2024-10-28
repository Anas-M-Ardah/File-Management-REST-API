async function deleteFile(fileName) {
    try {
        const response = await fetch('/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName })
        });

        const data = await response.json();
        console.log('File deleted:', data);
        window.location.reload();
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('Search input element not found.');
        return;
    }

    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        console.warn('Search term is empty.');
        return;
    }

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerm })
        });

        if (!response.ok) {
            console.error('Search request failed:', response.statusText);
            return;
        }

        const data = await response.json();
        const { files } = data;
        reRenderTable(files);
    } catch (error) {
        console.error('Error performing search:', error);
    }
}

function reRenderTable(data) {
    if (!data) {
        console.error('Search results data is null or undefined.');
        return;
    }

    const fileTable = document.getElementById('fileTable');
    if (!fileTable) {
        console.error('File table element not found.');
        return;
    }

    // Clear the current table content
    fileTable.innerHTML = '';

    // If data is empty, show "No results" message
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="2" class="empty-state">
                <div class="empty-state-content">
                    <p class="empty-state-text">No files found</p>
                    <p class="empty-state-subtext">Try different search terms or check your spelling</p>
                </div>
            </td>
        `;
        fileTable.appendChild(emptyRow);
        return;
    }

    // Otherwise, render the data rows
    data.forEach((file) => {
        if (!file || !file.fileName) {
            console.error('File data is null or undefined.');
            return;
        }

        const row = document.createElement('tr');
        const encodedFileName = encodeURIComponent(file.fileName);
        
        row.innerHTML = `
            <td class="file-table-data">${escapeHtml(file.fileName)}</td>
            <td class="file-table-data">
                <button onclick="window.location.href='/view?fileName=${encodedFileName}'" class="action-button">View</button>
                <button onclick="window.location.href='/edit?fileName=${encodedFileName}'" class="action-button">Edit</button>
                <button onclick="deleteFile('${escapeHtml(file.fileName)}')" class="action-button">Delete</button>
                <button onclick="compressFile('<%= file.fileName %>')" class="action-button">Compress File</button>
                <button onclick="window.location.href='/download?fileName=${encodedFileName}'" class="action-button">Download</button>
            </td>
        `;
        fileTable.appendChild(row);
    });
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function compressFile(fileName) {
    try {
        // Send POST request to /compress
        const response = await fetch('/compress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName })
        });

        if (!response.ok) {
            console.error('Compress request failed:', response.statusText);
            return;
        }

        // Log successful response message or handle response if needed
        console.log("File compressed successfully.");
        
        // Reload the page to reflect changes
        window.location.reload();
        
    } catch (error) {
        console.error('Error compressing file:', error);
    }
}


