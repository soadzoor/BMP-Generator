function downloadFile(object, defaultFileName)
{
	const url = window.URL.createObjectURL(object);
	const a = document.createElement("a");
	a.href = url;

	a.setAttribute("download", defaultFileName);
	a["download"] = defaultFileName;

	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
function drawbmp()
{
	const WIDTH  = parseInt(document.getElementById("width").value);
	const HEIGHT = parseInt(document.getElementById("height").value);
	
	var headers = [];
	headers.length = 13;

	var x; var y; var n;
	var red, green, blue;

	var extrabytes = 4 - ((WIDTH * 3) % 4);             // How many bytes of padding to add to each
														// horizontal line - the size of which must
														// be a multiple of 4 bytes.
	if (extrabytes === 4)
		extrabytes = 0;

	const paddedsize = ((WIDTH * 3) + extrabytes) * HEIGHT;

	// Headers...
	// Note that the "BM" identifier in bytes 0 and 1 is NOT included in these "headers".

	headers[0] = paddedsize + 54;      // bfSize (whole file size)
	headers[1] = 0;                    // bfReserved (both)
	headers[2] = 54;                   // bfOffbits
	headers[3] = 40;                   // biSize
	headers[4] = WIDTH;  // biWidth
	headers[5] = HEIGHT; // biHeight

						 // Would have biPlanes and biBitCount in position 6, but they're shorts.
						 // It's easier to write them out separately (see below) than pretend
						 // they're a single int, especially with endian issues...

	headers[7] = 0;                    // biCompression
	headers[8] = paddedsize;           // biSizeImage
	headers[9] = 0;                    // biXPelsPerMeter
	headers[10] = 0;                    // biYPelsPerMeter
	headers[11] = 0;                    // biClrUsed
	headers[12] = 0;                    // biClrImportant

	//
	// Headers begin...
	// When printing ints and shorts, we write out 1 character at a time to avoid endian issues.
	//
	
	var img = new Uint8ClampedArray(headers[0]);

	img[0] = 66; // 'B'
	img[1] = 77; // 'M'

	for (n = 0; n <= 5; n++)
	{
		img[n*4 + 2] =  headers[n] & 0x000000FF;
		img[n*4 + 3] = (headers[n] & 0x0000FF00) >> 8;
		img[n*4 + 4] = (headers[n] & 0x00FF0000) >> 16;
		img[n*4 + 5] = (headers[n] & 0xFF000000) >> 24;
	}

	// These next 4 characters are for the biPlanes and biBitCount fields.

	img[26] = 1;
	img[27] = 0;
	img[28] = 24;
	img[29] = 0;

	for (n = 7; n <= 12; n++)
	{
		img[(n-7)*4 + 30] =  headers[n] & 0x000000FF;
		img[(n-7)*4 + 31] = (headers[n] & 0x0000FF00) >> 8;
		img[(n-7)*4 + 32] = (headers[n] & 0x00FF0000) >> 16;
		img[(n-7)*4 + 33] = (headers[n] & 0xFF000000) >> 24;
	}

	//
	// Headers done, now write the data...
	//
	
	var subPixelCount = 0;
	
	var R = parseInt(document.getElementById("R").value);
	var G = parseInt(document.getElementById("G").value);
	var B = parseInt(document.getElementById("B").value);
	
	if (isNaN(WIDTH) || isNaN(HEIGHT) || isNaN(R) || isNaN(G) || isNaN(B))
	{
		alert("Please fill in all fields!");
		
		return;
	}

	for (y = HEIGHT - 1; y >= 0; y--)     // BMP image format is written from bottom to top...
	{
		for (x = 0; x <= WIDTH - 1; x++)
		{
			red = 0;
			blue = 0;
			green = 0;
			if (x % 3 === 0)
			{
				red = R;
			}
			else if (x % 3 === 1)
			{
				green = G;
			}
			else if (x % 3 === 2)
			{
				blue = B;
			}
			

			// Also, it's written in (b,g,r) format...

			img[54 + subPixelCount++] = blue;
			img[54 + subPixelCount++] = green;
			img[54 + subPixelCount++] = red;
		}
		if (extrabytes)      // See above - BMP lines must be of lengths divisible by 4.
		{
			for (n = 1; n <= extrabytes; n++)
			{
				img[54 + subPixelCount++] = 0;
			}
		}
		if (x*y % 1000000 === 0)
		{
			console.log("M pixel reached");
		}
	}
	
	return img;
}




function getImage()
{
	var f;
	try
	{
		var img = drawbmp();
		f = new File([img], "image.bmp", {type: "image/bmp", lastModified: Date.now()})
		downloadFile(f, "image.bmp");
	}
	catch(e)
	{
		alert("Oops. Something went wrong. Please try with lower resolution!");
		
		return;
	}
	
	return f;
}



document.getElementById("myButton").addEventListener('click', function()
{
	getImage();
});