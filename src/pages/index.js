import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { collection, doc, getDocs, getDoc, query, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  // Fetch inventory from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const inventory = [];
    docs.forEach(doc => {
      inventory.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventory);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  // Add item to the inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  // Remove item from the inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 0) {
        await setDoc(docRef, { quantity: quantity - 1 });
      } else if (quantity === 0) {
        await deleteDoc(docRef);
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  // Analyze image using your new API route
  const analyzeImage = async (imageData) => {
    try {
      const response = await axios.post('/api/analyze-image', { image: imageData });
      const description = response.data.description;
      if (description) {
        addItem(description.toLowerCase());
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error analyzing image, please try again.');
    }
  };

  // Convert captured image to base64 and analyze
  const handleTakePhoto = async () => {
    try {
      const takenPhoto = camera.current.takePhoto();
      const base64Image = takenPhoto.split(',')[1]; // Remove the data:image/jpeg;base64, part
      setImage(takenPhoto);
      await analyzeImage(base64Image);
      handleCameraClose();
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Error taking photo, please try again.');
    }
  };

  // Filtered inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      style={{ backgroundColor: 'white', color: 'black' }}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={1}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
        aria-labelledby="camera-modal-title"
        aria-describedby="camera-modal-description"
      >
        <Box sx={style}>
          <Typography id="camera-modal-title" variant="h6" component="h2">
            Take Picture
          </Typography>
          <Camera ref={camera} aspectRatio={4 / 3} />
          <Button
            variant="contained"
            onClick={handleTakePhoto}
          >
            Take Photo
          </Button>
          {image && <img src={image} alt="Taken" style={{ marginTop: '10px' }} />}
        </Box>
      </Modal>

      <TextField
        id="search"
        label="Search Inventory"
        variant="outlined"
        width="400px"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <Button variant="contained" onClick={handleCameraOpen}>
          Take Picture
        </Button>
      </Stack>

      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2" color="textPrimary" textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="100px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#D3D3D3"
              paddingX={5}
            >
              <Typography variant="h3" color="textPrimary" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="textPrimary" textAlign="center">
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}
                sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' }}}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
