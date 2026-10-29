const firstNames = ['CHUKWUEMEKA', 'BABATUNDE', 'CHINONSO', 'FATIMA', 'AMINU', 'NGOZI', 'OLUWASEUN', 'IBRAHIM'];
const lastNames = ['ADEBAYO', 'OKONKWO', 'BELLO', 'DANJUMA', 'BALOGUN', 'EZENWA', 'SULEIMAN', 'ALABI'];
const states = ['LAGOS', 'ABUJA', 'KANO', 'RIVERS', 'ENUGU', 'OGUN', 'OYO', 'KADUNA'];
const streets = ['Marina Street', 'Broad Street', 'Ahmadu Bello Way', 'Gana Street', 'Constitution Avenue'];

const faker = {
  person: {
    firstName: () => firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: () => lastNames[Math.floor(Math.random() * lastNames.length)],
    fullName: () => `${firstNames[0]} ${lastNames[0]}`,
    middleName: () => 'CHUKWU',
    prefix: () => 'Mr.',
    suffix: () => 'Jr.',
  },
  location: {
    state: () => states[Math.floor(Math.random() * states.length)],
    city: () => 'Lagos',
    streetAddress: () => `12 ${streets[Math.floor(Math.random() * streets.length)]}`,
    zipCode: () => '100001',
    country: () => 'Nigeria',
  },
  string: {
    numeric: (length = 10) => {
      let str = '';
      for (let i = 0; i < length; i++) {
        str += Math.floor(Math.random() * 10);
      }
      return str;
    },
    alphanumeric: (length = 10) => 'ABC123XYZ'.slice(0, length),
    uuid: () => '12345678-1234-4234-8234-123456789abc',
  },
  date: {
    past: (years = 30) => new Date(1990, 0, 1),
    birthdate: () => new Date(1992, 4, 18),
    recent: () => new Date(),
  },
  phone: {
    number: () => `080${Math.floor(10000000 + Math.random() * 90000000)}`,
  },
};

module.exports = {
  faker,
  default: faker,
};
