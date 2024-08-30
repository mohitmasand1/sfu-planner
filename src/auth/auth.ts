export async function getUserInfo(codeResponse: any) {
    var response = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: codeResponse.code }),
    });
    return await response.json();
  }

  export async function getLoggedInUser() {
    try {
      const response = await fetch('http://localhost:5000/api/auth/protected', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Include cookies in the request
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch logged-in user:', error);
      throw error;
    }
  }