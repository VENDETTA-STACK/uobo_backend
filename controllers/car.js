const carServices = require('../services/car');
const dealerServices = require('../services/dealer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const convertCsvToJson = async (csvFilePath, dealerId) => {
    const jsonData = [];

    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const rows = fileContent.trim().split('\n');

    const headers = rows[0].split(',');
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        const rowData = {};

        for (let j = 0; j < headers.length; j++) {
            // Replace spaces with underscores in keys
            let cleanedKey = headers[j].replace(/"/g, '').replace(/\s+/g, '_');
            
            // Remove double quotes from values
            const cleanedValue = row[j].replace(/"/g, '');

            if (cleanedKey === 'New/Used') {
                cleanedKey = 'New_or_Used';
            }

            if (cleanedKey === 'Certified_Pre-owned') {
                cleanedKey = 'Certified_Pre_owned';
            }

            rowData[cleanedKey] = cleanedValue;
        }

        jsonData.push(rowData);

        await addCSVRawToDB(rowData, dealerId);
    }

    return jsonData; 
}

const addCSVRawToDB = async (dataRow, dealerId) => {
    try {
        if (dataRow !== undefined && dataRow !== null) {
            const VINNumber = dataRow.VIN;
            const checkExist = await carServices.getCarByVIN(VINNumber);

            if (checkExist.length) {
                const updateCarDetails = await carServices.editCarDetails(dataRow);
            } else {
                const addCarDetails = await carServices.addNewCar(dataRow, dealerId);
            }
        }    
    } catch (error) {
        return error.message;
    }

}

module.exports = {
    addNewCar: async (req, res, next) => {
        try {
            let params = req.body;
            
            if (!params.dealerId) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Dealer Id (dealerId) is required parameter" });
            }

            const csvFilePath = path.join(__dirname, '../data/EmpireAutoLondon.csv');

            // console.log(csvFilePath);

            let carData = await convertCsvToJson(csvFilePath, params.dealerId);

            // console.log(data);

            return res.status(200).json({ IsSuccess: true, Count: carData.length, Data: carData, Message: "Car data added" });

            // let dealer = await dealerServices.getDealerByDealerId(params.dealerId);

            // if (dealer === undefined || dealer === null) {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'No dealer found' });
            // }

            // let addCar = await carServices.addNewCar(params);

            // if (addCar) {
            //     return res.status(200).json({ IsSuccess: true, Data: [addCar], Message: 'Car added' });
            // } else {
            //     return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Car not added' });
            // }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getAllCars: async (req, res, next) => {
        try {
            let cars = await carServices.getAllCars();

            if (cars.length) {
                return res.status(200).json({ IsSuccess: true, Count: cars.length, Data: cars, Message: 'Cars found' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Cars not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getDealerCars: async (req, res, next) => {
        try {
            const dealerId = req.params.dealerId;

            if (dealerId === undefined || dealerId === null || dealerId === "") {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Dealer Id (dealerId) is required parameter" });
            }

            let cars = await carServices.getCarByDealerId(dealerId);

            if (cars.length) {
                return res.status(200).json({ IsSuccess: true, Count: cars.length, Data: cars, Message: 'Cars found' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Cars not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getCar: async (req, res, next) => {
        try {
            const carId = req.params.id
            let carDetails = await carServices.getCarById(carId);

            if (carDetails) {
                return res.status(200).json({ IsSuccess: true, Data: [carDetails], Message: 'Car data found' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Car not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    editCarDetails: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.carId) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please required car id parameter' });
            }

            let updateCarDetails = await carServices.editCarDetails(params);

            if (updateCarDetails) {
                return res.status(200).json({ IsSuccess: true, Data: updateCarDetails, Message: 'Car details updated' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Car details not updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    deleteCar: async (req, res, next) => {
        try {
            const dealerId = req.params.dealerId;

            if (dealerId === undefined || dealerId === null || dealerId === "") {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: "Dealer Id (dealerId) is required parameter" });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    addCarType: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.name) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Vehicle type name is required' });
            }

            if (!params.icon) {
                return res.status(401).json({ IsSuccess: false, Data: [], Message: 'Vehicle type icon is required' });
            }

            let addType = await carServices.addVehicleType(params);

            if (addType) {
                return res.status(200).json({ IsSuccess: true, Data: addType, Message: 'Vehicle Type added' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Vehicle Type not added' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    getVehicleCategories: async (req, res, next) => {
        try {

            let vehicleCategories = await carServices.getVehicleType();

            if (vehicleCategories.length) {
                return res.status(200).json({ IsSuccess: true, Count: vehicleCategories.length, Data: vehicleCategories, Message: 'Vehicle types found' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Vehicle type not found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    },

    searchCarInventory: async (req, res, next) => {
        try {
            const { keyword } = req.query;

            const dealer = req.user;

            if (!keyword) {
                return res.status(401).json({ 
                    IsSuccess: false, 
                    Data: [], 
                    Message: 'Keyword is required in the query parameters' 
                });
            }

            const cars = await carServices.searchOperation(keyword, dealer._id);

            if (cars) {
                return res.status(200).json({ 
                    IsSuccess: true, 
                    Count: cars.length, 
                    Data: cars, 
                    Message: 'Search car result found' 
                });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Search car found' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Message: error.message });
        }
    }
}