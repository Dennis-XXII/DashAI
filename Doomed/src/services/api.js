import axios from "axios";

const API_BASE_URL = "https://dashai-backend-x5sj.onrender.com";

export const getOverviewData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching overview data:", error);
      throw error;
    }
  };

export const getGrowthData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/client_growth/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching growth data:", error);
      throw error;
    }
  };

  export const getNewClientsData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/new_clients/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching new clients data:", error);
      throw error;
    }
  };

  export const getTotalMembersData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/memberships/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching total members data:", error);
      throw error;
    }
  };

  export const getNewMembersData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/memberships/new/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching new members data:", error);
      throw error;
    }
  };

  export const getTopSpendersData= async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/spender`);
      return response.data;
    } catch (error) {
      console.error("Error fetching most spending members' data:", error);
      throw error;
    }
  };

  export const getUpcomingBirthdayData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/upcoming_bdays/`);
        console.log("API Response:", response.data); 
        return response.data;
    } catch (error) {
        console.error("Error fetching upcoming birthdays data:", error.response?.data || error.message);
        throw error;
    }
};

export const getMembershipTierData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/memberships/tiers`);
        console.log("API Response:", response.data); 
        return response.data;
    } catch (error) {
        console.error("Error fetching membership tier data:", error.response?.data || error.message);
        throw error;
    }
};

export const getNationalityData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/nationality/`);
        console.log("API Response:", response.data); 
        return response.data;
    } catch (error) {
        console.error("Error fetching nationality data:", error.response?.data || error.message);
        throw error;
    }
};