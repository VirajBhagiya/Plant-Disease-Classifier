// Import necessary React hooks and components from Material-UI
import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress } from "@material-ui/core";
import { DropzoneArea } from 'material-ui-dropzone';
import { common } from '@material-ui/core/colors';
import Clear from '@material-ui/icons/Clear';
import axios from 'axios';
import { useCallback } from 'react';
// Import images
import image from "./gg.png";
import cblogo from "./logo.png";

// Custom button styling using withStyles
const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    '&:hover': {
      backgroundColor: '#ffffff7a',
    },
  },
}))(Button);

// makeStyles hook to define styles for the components
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  clearButton: {
    backgroundColor: "#679436",
    width: "-webkit-fill-available",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  root: {
    maxWidth: 345,
    flexGrow: 1,
  },
  media: {
    height: 400,
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 500,
  },
  gridContainer: {
    justifyContent: "center",
    padding: "4em 1em 0 1em",
  },
  mainContainer: {
    backgroundImage: `url(${image})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: "93vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: 'transparent',
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '15px',
  },
  imageCardEmpty: {
    height: 'auto',
  },
  noImage: {
    margin: "auto",
    width: 400,
    height: "400 !important",
  },
  input: {
    display: 'none',
  },
  uploadIcon: {
    background: 'trasparent',
  },
  tableContainer: {
    backgroundColor: 'silver !important',
    boxShadow: 'none !important',
  },
  table: {
    backgroundColor: 'silver !important',
  },
  tableHead: {
    backgroundColor: 'silver !important',
  },
  tableRow: {
    backgroundColor: '#264027 !important',
  },
  tableCell: {
    fontSize: '22px',
    backgroundColor: '#264027',
    borderColor: '#264027',
    color: 'silver !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableCell1: {
    fontSize: '14px',
    backgroundColor: '#264027',
    borderColor: '#264027',
    color: 'silver !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableBody: {
    backgroundColor: '#264027 !important',
  },
  text: {
    color: 'white !important',
    textAlign: 'center',
  },
  buttonGrid: {
    maxWidth: "416px",
    width: "100%",
  },
  detail: {
    backgroundColor: '#264027',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  detailCard: {
    margin: theme.spacing(2),
    backgroundColor: '#764134',
    padding: theme.spacing(2),
    fontWeight: 'bolder',
    borderRadius: '15px',
  },
  appbar: {
    background: '#2c2c2d',
    boxShadow: 'none',
    color: 'white'
  },
  loader: {
    color: '#be6a77 !important',
  }
}));

// Disease actions based on the detected disease
const diseaseActions = {
  "Late Blight": {
    actions: [
      "Remove infected leaves and destroy them.",
      "Avoid overhead watering to keep foliage dry.",
      "Apply fungicides to protect plants during wet weather."
    ],
    url: "https://www.agriplexindia.com/blogs/featured/late-blight-in-potato"
  },

  "Early Blight": {
    actions: [
      "Improve air circulation around plants.",
      "Mulch around the base to prevent spore splash.",
      "Use fungicide sprays as a preventative measure before symptoms appear."
    ],
    url: "https://www.seipasa.com/en/blog/early-blight-in-potato-identification-and-control/#:~:text=When%20the%20first%20symptoms%20of,Equisetum%20arvense%20extract%20which%2C%20isolated"
  },

  "Healthy": {
    actions: [
      "Continue regular monitoring for any signs of disease.",
      "Maintain soil health with proper fertilization and pH management.",
      "Ensure adequate spacing and air circulation to prevent fungal growth."
    ],
    url: "https://www.yara.co.uk/crop-nutrition/agronomy-advice/potato-blog/#:~:text=Key%20nutrients%20for%20healthy%20potatoes,over%20200kg%2Fha%20of%20potassium."
  }
};

// ImageUpload component to handle image upload and processing
export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState(); // State to store the selected file
  const [preview, setPreview] = useState(); // State to store the preview of the selected file
  const [data, setData] = useState(); // State to store the response from the server
  const [image, setImage] = useState(false); // State to check if an image is selected
  const [isLoading, setIsloading] = useState(false); // State to check if the image is being processed
  const [actions, setActions] = useState([]); // State to store recommended actions
  let confidence = 0;

  // Function to send the selected file to the server for processing
  const sendFile = useCallback(async () => {
    if (selectedFile) {
      setIsloading(true);
      let formData = new FormData();
      formData.append("file", selectedFile);
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_API_URL,
        data: formData,
      });
      if (res.status === 200) {
        const detectedDisease = res.data.class;
        const diseaseData = diseaseActions[detectedDisease] || {
          actions: ["No specific actions available for this disease."],
          url: "#"  // Default to a safe placeholder if no URL is available
        };
        setData({
          ...res.data,
          actions: diseaseData.actions,
          url: diseaseData.url
        });
      }
      setIsloading(false);
    }
  }, [selectedFile]);

  // Function to clear the data and reset the states
  const clearData = () => {
    setData(null);
    setActions([]);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  // useEffect hook to update the preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  // useEffect hook to send the file for processing when the preview is updated
  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsloading(true);
    sendFile();
  }, [preview, sendFile]);

  // Function to handle the file selection
  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  // Function to handle the file upload
  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            Green Guardian: A Plant Disease Classifier
          </Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo}></Avatar>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters={true}>
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}>
              {image && <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={preview}
                  component="image"
                  title="Contemplative Reptile"
                />
              </CardActionArea>
              }
              {!image && <CardContent className={classes.content}>
                <DropzoneArea
                  acceptedFiles={['image/*']}
                  dropzoneText={"Drag and drop an image of a plant leaf to process"}
                  onChange={onSelectFile}
                />
              </CardContent>}
              {data && <CardContent className={classes.detail}>
                <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table className={classes.table} size="small" aria-label="simple table">
                    <TableHead className={classes.tableHead}>
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableCell1}>Label:</TableCell>
                        <TableCell align="right" className={classes.tableCell1}>Confidence:</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className={classes.tableBody}>
                      <TableRow className={classes.tableRow}>
                        <TableCell component="th" scope="row" className={classes.tableCell}>
                          {data.class}
                        </TableCell>
                        <TableCell align="right" className={classes.tableCell}>{confidence}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>}
              {isLoading && <CardContent className={classes.detail}>
                <CircularProgress color="secondary" className={classes.loader} />
                <Typography className={classes.title} variant="h6" noWrap>
                  Processing
                </Typography>
              </CardContent>}
              {data && !actions && <CardContent>
                <Typography variant="body2">No recommended actions available.</Typography>
              </CardContent>}
            </Card>
          </Grid>
          {data &&
            <Grid item className={classes.buttonGrid} >
              <ColorButton variant="contained" className={classes.clearButton} color="primary" component="span" size="large" onClick={clearData} startIcon={<Clear fontSize="large" />}>
                Clear
              </ColorButton>
            </Grid>}
        </Grid >
        {data && (
          <Grid item xs={12}>
            <Card className={classes.detailCard}>
              <CardContent>
                {Array.isArray(data.actions) && data.actions.length > 0 ? (
                  <>
                    <Typography variant="h4" component="h2">Recommended Actions for {data.class}</Typography>
                    <ul>
                      {data.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                    <br/>
                    <Typography variant="overline">
                      Learn more about <a href={data.url} target="_blank" rel="noopener noreferrer">{data.class}</a> management.
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" component="p">
                    No specific actions recommended at this time.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Container >
    </React.Fragment >
  );
};