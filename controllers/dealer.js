const dealerServices = require('../services/dealer');
const userServices = require('../services/user');
const awsServices = require('../config/aws-services');
const fs = require('fs');

const uploadedImage = async (base64Image, fileNameConst) => {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
      
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image string');
    }
    
    const fileFormat = matches[1];
    const base64Data = matches[2];
    
    // Remove the data:image/png;base64 part
    const dataBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileName = `${fileNameConst}_${Date.now()}.${fileFormat}`;
    
    const filePath = `uploads/${fileName}`;
    
    // Save the image to the "uploads" folder
    fs.writeFile(filePath, dataBuffer, (err) => {
        if (err) {
        console.error(err);
        throw new Error('Error uploading image');
        } else {
        console.log('Image uploaded successfully');
        }
    });
    
    return fileName;
}

const deleteImage = async (fileName) => {
    const filePath = `uploads/${fileName}`;
  
    // Delete the image file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error deleting image');
      } else {
        console.log('Image deleted successfully');
      }
    });
}

const uploadCsvFile = async (base64Csv, fileNameConst) => {
    const matches = base64Csv.match(/^data:text\/csv;base64,(.+)$/);
      
    if (!matches || matches.length !== 2) {
        throw new Error('Invalid base64 CSV string');
    }
    
    const base64Data = matches[1];
    
    // Remove the data:text/csv;base64 part
    const dataBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileName = `${fileNameConst}_${Date.now()}.csv`;
    
    const filePath = `uploads/${fileName}`;
    
    // Save the CSV file to the "uploads" folder
    fs.writeFile(filePath, dataBuffer, (err) => {
        if (err) {
            console.error(err);
            throw new Error('Error uploading CSV file');
        } else {
            console.log('CSV file uploaded successfully');
        }
    });
    
    return fileName;
}

module.exports = {
    addNewDealer: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!params.name) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer name is required parameter' });
            }
            
            let addDealerDetails = await dealerServices.addDealer(params);

            if (addDealerDetails) {
                return res.status(200).json({ IsSuccess: true, Data: [addDealerDetails], Message: 'Dealer added successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    dealerRegistration: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.dealerShipName) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide dealerShipName' });
            }

            if (!params.firstName) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide firstName' });
            }

            if (!params.lastName) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide lastName' });
            }

            if (!params.OMVICLicenceLink) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide OMVICLicenceLink' });
            }

            // if (!params.countryCode) {
            //     return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide mobile countryCode' });
            // }

            if (!params.email) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide email parameter' });
            }

            if (!params.number) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Please provide mobile number' });
            }

            let uploadInventoryCSV;

            let csvFile = req.file;

            if (csvFile) {
                uploadInventoryCSV = await awsServices._uploadCSV(csvFile,'Dealers_Inventory','csv',params.dealerShipName);
                console.log(uploadInventoryCSV);
            }

            let registerDealerData = await dealerServices.registerDealer(params);

            if (registerDealerData) {
                // if (uploadInventoryCSV) {
                //     return res.status(200).json({ 
                //         IsSuccess: true, 
                //         Data: [registerDealerData], 
                //         InventoryURL: uploadInventoryCSV.URL, 
                //         Message: 'Dealer registration successfully' 
                //     });
                // } else {
                //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer not registered' });
                // }
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Data: [registerDealerData], 
                    InventoryURL: uploadInventoryCSV ? uploadInventoryCSV.URL : undefined, 
                    Message: 'Dealer registration successfully' 
                });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer not registered' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    dealerLogin: async (req, res, next) => {
        try {
            const params = req.body;

            let dealer = await dealerServices.loginDealer(params);

            if (dealer) {
                const token = await userServices.createUserToken(dealer._id);

                if (token) {
                    return res.status(200).json({ IsSuccess: true, Data: {dealer, token}, Message: "Dealer LoggedIn" });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: "Dealer token not created" });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: "Dealer not found" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },
    
    getDealer: async (req, res, next) => {
        try {
            const dealerId = req.query.id;
            const dealer = req.user;

            if (!dealer) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (dealer) {
                let dealerInformation = await dealerServices.getNearByDealer();
                // const dealerInventory = await carServices.getCarByDealerId(dealer._id);
                // const dealerRating = await dealerServices.getDealerRating();
                return res.status(200).json({ IsSuccess: true, Data: dealerInformation, Message: 'Dealer details found' });
                // let dealer = await dealerServices.getDealerByDealerId(dealerId);

                // if (dealer) {
                //     return res.status(200).json({ IsSuccess: true, Data: [dealer], Message: 'Dealer details found' });
                // } else {
                //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer details not found' });
                // }
            } else {
                let dealers = await dealerServices.getAllDealers();

                if (dealers) {
                    return res.status(200).json({ IsSuccess: true, Data: dealers, Message: 'Dealers details found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealers details not found' });
                }
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    updateDealer: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!params.dealerId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealerId found' });
            }

            let checkExistDealer = await dealerServices.getDealerByDealerId(params.dealerId);

            if (checkExistDealer) {
                let update = await dealerServices.editDealerDetails(params);

                if (update) {
                    return res.status(200).json({ IsSuccess: true, Data: [update], Message: 'Dealer details updated' });
                } else {
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Dealer details not updated' });
                }
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer found' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    deleteDealer: async (req, res, next) => {
        try {
            const dealerId = req.params.id;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!dealerId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealerId found' });
            }

            let checkExistDealer = await dealerServices.getDealerByDealerId(dealerId);

            if (checkExistDealer) {
                let deleteDealer = await dealerServices.deleteDealer(dealerId);

                return res.status(200).json({ IsSuccess: true, Data: [], Message: 'Dealer deleted' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    addDealerRating: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (!params.dealerId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer Id is required' });
            }

            let addRating = await dealerServices.addDealerRating(params);

            if (addRating !== undefined) {
                return res.status(200).json({ IsSuccess: true, Data: [addRating], Message: "Dealer rating added" });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: "Dealer rating not added" });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getDealerRatings: async (req, res, next) => {
        try {
            const dealerId = req.params.id;
            const user = req.user;

            if (!user) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Unauthorized access' });
            }

            if (dealerId !== undefined && dealerId !== null && dealerId !== '') {
                console.log('inn', dealerId)
                let dealerRatings = await dealerServices.getDealerRating(dealerId);

                if (dealerRatings) {
                    return res.status(200).json({ IsSuccess: true, Data: [dealerRatings], Message: 'Dealer rating found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealer rating not found' });
                }
            } else {
                let dealersRatings = await dealerServices.getAllDealerRating();

                if (dealersRatings) {
                    return res.status(200).json({ IsSuccess: true, Data: dealersRatings, Message: 'Dealers rating found' });
                } else {
                    return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Dealers rating not found' });
                }
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },
}