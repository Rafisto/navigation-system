import axios from 'axios';

interface APITakeoffResponse {
    message: string;
}

const APITakeoff = async () => {
    await axios.get('http://localhost:5000/api/takeoff').then((response) => {
        return response.data as APITakeoffResponse;
    })
}

export { APITakeoff };