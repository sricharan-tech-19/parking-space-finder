const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const parkingSchema = new mongoose.Schema({
    name: String,
    city: String,
    coords: { latitude: Number, longitude: Number },
    availability: Number,
    price: String,
    hours: String,
});

const Parking = mongoose.model('Parking', parkingSchema);

const parkingData = [
    // Bangalore (12 spots)
    { name: "Fort Mall Parking", city: "Bangalore", coords: { latitude: 12.9716, longitude: 77.5946 }, availability: 25, price: "₹50/hour", hours: "24/7" },
    { name: "Indiranagar Spot 1", city: "Bangalore", coords: { latitude: 12.9716, longitude: 77.6412 }, availability: 18, price: "₹40/hour", hours: "6:00 AM - 11:00 PM" },
    { name: "Koramangala Plaza", city: "Bangalore", coords: { latitude: 12.9352, longitude: 77.6245 }, availability: 12, price: "₹60/hour", hours: "24/7" },
    { name: "MG Road Parking", city: "Bangalore", coords: { latitude: 12.9352, longitude: 77.6009 }, availability: 8, price: "₹70/hour", hours: "24/7" },
    { name: "Whitefield Tech Park", city: "Bangalore", coords: { latitude: 12.9698, longitude: 77.7499 }, availability: 35, price: "₹30/hour", hours: "24/7" },
    { name: "Ulsoor Lake Parking", city: "Bangalore", coords: { latitude: 12.9689, longitude: 77.5941 }, availability: 15, price: "₹45/hour", hours: "7:00 AM - 10:00 PM" },
    { name: "Jayanagar Spot", city: "Bangalore", coords: { latitude: 12.9352, longitude: 77.5946 }, availability: 22, price: "₹35/hour", hours: "24/7" },
    { name: "Marathahalli Parking", city: "Bangalore", coords: { latitude: 12.9698, longitude: 77.7068 }, availability: 10, price: "₹40/hour", hours: "24/7" },
    { name: "Silk Board Spot", city: "Bangalore", coords: { latitude: 12.9352, longitude: 77.6509 }, availability: 5, price: "₹65/hour", hours: "24/7" },
    { name: "Yeshwantpur Station", city: "Bangalore", coords: { latitude: 13.0011, longitude: 77.5720 }, availability: 20, price: "₹25/hour", hours: "6:00 AM - 12:00 AM" },
    { name: "Banaswadi Parking", city: "Bangalore", coords: { latitude: 13.0581, longitude: 77.6245 }, availability: 18, price: "₹30/hour", hours: "24/7" },
    { name: "Electronic City Spot", city: "Bangalore", coords: { latitude: 12.8395, longitude: 77.6770 }, availability: 28, price: "₹20/hour", hours: "24/7" },
    { id: 'blr13', name: 'Phoenix Market City', coords: { latitude: 12.9711, longitude: 77.6412 }, availability: 32, price: '₹45/hr', hours: '24 hours', city: 'Bangalore' },
    { id: 'blr14', name: 'Forum Mall Parking', coords: { latitude: 12.9762, longitude: 77.6446 }, availability: 28, price: '₹40/hr', hours: '24 hours', city: 'Bangalore' },
    { id: 'blr15', name: 'Orion Mall', coords: { latitude: 12.9689, longitude: 77.7068 }, availability: 25, price: '₹35/hr', hours: '24 hours', city: 'Bangalore' },


    // Chennai (10 spots)
    { id: 'che1', name: 'Ragtag Parking', coords: { latitude: 13.03581, longitude: 80.27015 }, availability: 15, price: '₹40/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che2', name: 'Sricharan radiance', coords: { latitude: 13.141500109470506, longitude: 80.22391809594305 }, availability: 8, price: '₹35/hr', hours: '8am - 10pm', city: 'Chennai' },
    { id: 'che3', name: 'VIT Chennai Campus', coords: { latitude: 12.840866429530545, longitude: 80.15344892080635 }, availability: 50, price: '₹20/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che4', name: 'T Nagar Shopping District', coords: { latitude: 13.0418, longitude: 80.2341 }, availability: 6, price: '₹60/hr', hours: '10am - 10pm', city: 'Chennai' },
    { id: 'che5', name: 'Marina Beach Parking', coords: { latitude: 13.0475, longitude: 80.2824 }, availability: 20, price: '₹30/hr', hours: '6am - 11pm', city: 'Chennai' },
    { id: 'che6', name: 'Express Avenue Mall', coords: { latitude: 13.0569, longitude: 80.2676 }, availability: 12, price: '₹50/hr', hours: '10am - 11pm', city: 'Chennai' },
    { id: 'che7', name: 'Chennai Central Railway', coords: { latitude: 13.0827, longitude: 80.2707 }, availability: 35, price: '₹25/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che8', name: 'Anna Nagar Tower Park', coords: { latitude: 13.0850, longitude: 80.2101 }, availability: 10, price: '₹35/hr', hours: '6am - 10pm', city: 'Chennai' },
    { id: 'che9', name: 'OMR IT Corridor', coords: { latitude: 12.9171, longitude: 80.2275 }, availability: 30, price: '₹25/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che10', name: 'Velachery Bus Terminus', coords: { latitude: 12.9854, longitude: 80.2180 }, availability: 18, price: '₹30/hr', hours: '5am - 12am', city: 'Chennai' },
    { id: 'che12', name: 'Spencer Plaza', coords: { latitude: 13.0384, longitude: 80.2519 }, availability: 19, price: '₹35/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che13', name: 'Pondy Bazaar', coords: { latitude: 13.0384, longitude: 80.2347 }, availability: 22, price: '₹30/hr', hours: '24 hours', city: 'Chennai' },

];

const seedDatabase = async () => {
    try {
        console.log('\n🔗 Connecting to MongoDB Atlas...');

        await mongoose.connect(process.env.MONGO_URI);

        console.log('✅ Connected to MongoDB!\n');

        await Parking.deleteMany({});
        console.log('🗑️  Cleared existing data');

        const result = await Parking.insertMany(parkingData);
        console.log(`✅ Added ${result.length} parking spots`);

        const count = await Parking.countDocuments();
        console.log(`📊 Total: ${count} parkings`);

        const bangalore = await Parking.countDocuments({ city: "Bangalore" });
        const chennai = await Parking.countDocuments({ city: "Chennai" });
        console.log(`   • Bangalore: ${bangalore} spots`);
        console.log(`   • Chennai: ${chennai} spots\n`);

        await mongoose.disconnect();
        console.log('✅ Database seeding completed!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
