import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { image } = req.body;
    const apiKey = process.env.HUGGINGFACE_API_KEY; // Ensure you have your API key in your environment variables

    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/resnet-50',
        { inputs: image },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        console.error('Error from Hugging Face API:', response.data.error);
        res.status(500).json({ error: response.data.error });
      } else {
        // Extract the first word of the label
        const fullDescription = response.data[0].label;
        const singleWordDescription = fullDescription.split(',')[0].split(' ')[0];
        res.status(200).json({ description: singleWordDescription });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      res.status(500).json({ error: 'Error analyzing image' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
