const { default: axios2 } = require("axios");

const BACKEND_URL = "http://localhost:3000";

const WS_URL = "ws://localhost:3001";

const axios = {
    get: async (...args) => {
        try {
            return await axios2.get(...args)
        } catch (error) {
            return error.response
        }
    },
    post: async (...args) => {
        try {
            return await axios2.post(...args)
        } catch (error) {
            return error.response
        }
    },
    delete: async (...args) => {
        try {
            return await axios2.delete(...args)
        } catch (error) {
            return error.response
        }
    },
    put: async (...args) => {
        try {
            return await axios2.put(...args)
        } catch (error) {
            return error.response
        }
    }
}

describe("Authencation", () => { 
    test("User is able to sign up only once", async () => {
        const username = "dishxxasaank" + Math.random();
        const password = "dihsankoza" + Math.random();
        const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });
        expect(res.status).toBe(200);

        const updatedRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
            password,
            type: "admin"
        });
        expect(updatedRes.status).toBe(400);
    })

    test("Signup req fails if the username is empty", async () => {
        const password = "dishank" + Math.random();
        const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(res.status).toBe(400);
    })

    test("Signin succeeds if the username and password are correct", async () => {
        const username = `askahnssdsdsdsdk-${Math.random()}`;
        const password = "dishank" + Math.random();
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password
        })
        expect(res.status).toBe(200);
        expect(res.data.token).toBeDefined();
    })

    test("sign in fails if the username and password are incorrect", async () => {
        const username = `akshssdsdsdsdsank-${Math.random()}`;
        const password = "dishank" + Math.random();
        await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        
        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: 'worngusersasasasname', 
            password
        })
        expect(res.status).toBe(403);
    })
})

describe("User metadata endpoint", () => {
    let token;
    let avatarId;
    beforeAll(async () => {
        const username = `dishank-${Math.random()}`;
        const password = "dishank" + Math.random();
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
            type: "admin"
        })
        
        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = res.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://zawadiya",
            name: "dishank"
        },
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    )

        avatarId = avatarResponse.data.avatarId;

    })
    
    test("User can't update metadata using wrong avatar id", async () => {
        const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: '232323232323'
        }, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });

        expect(res.status).toBe(400);
        
    })

    test("User can update metadata using right avatar id", async () => {
        
        const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        }, {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });

        expect(res.status).toBe(200);
    })

    
    test("User can't update metadata if auth header is not present", async () => {
        const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        });

        expect(res.status).toBe(403);
    })
})

describe("User avatar information", () => {
    let token;
    let avatarId;
    let userId;
    beforeAll(async () => {
        const username = `dishank-${Math.random()}`;
        const password = "dishank" + Math.random();
        const newUserRes = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
            type: "admin"
        })

        userId = newUserRes.data.userId;

        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = res.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://zawadiya",
            name: "dishank"
        },{
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        
        

        avatarId = avatarResponse.data.avatarId;

    })

    test("get back avatar information for the user", async () => {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[
            ${userId}]`);
        
        expect(res.data.avatars.length).toBe(1);
    })
    
    test("get all the available avatars", async () => {
        const res = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        
        expect(res.data.avatars.length).not.toBe(0)
        expect(res.data.avatars.find(x => x.id === avatarId)).toBeDefined();
    })
})

describe("Space information", () => {
    let adminId, adminToken, element1Id, element2Id, mapId, userId, token ;
    beforeAll(async () => {
        const username = `dishank-${Math.random()}`;
        const password = "dishank" + Math.random();
        const signUpRes = axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: 'admin'
        });
        adminId = (await signUpRes).data.userId;

        const userRes = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });
        adminToken = userRes.data.token;

        const username1 = `dishank-${Math.random()}`;
        const signUpRes1 = axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username1,
            password,
            type: 'user'
        });
        userId = (await signUpRes1).data.userId;

        const userRes1 = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username1,
            password
        });
        token = userRes1.data.token;

        const element1Res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            });

        const element2Res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            });
    
        element1Id = element1Res.data.id
        element2Id = element2Res.data.id;
        
        const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,
            {
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": [{
                        elementId: element1Id,
                        x: 20,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 18,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 19,
                        y: 20
                    }
                ]
             },
             {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
             })
        mapId = mapRes.data.id;
    });

    test("User is able to create space with map id", async () => {
        const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Zawadiya",
            dimensions: '100x200',
            mapId
        },
        {
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
        expect(spaceRes.status).toBe(200);
        expect(spaceRes.data.spaceId).toBeDefined();
    });

    test("User is able to create space without map id (empty space)", async () => {
        const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Zawadiya",
            dimensions: '100x200',
        },
        {
            headers: {
                'authorization': `Bearer ${token}`
            }
        })
        
        expect(spaceRes.data.spaceId).toBeDefined();
    })
    
     test("User is not able to create space without map id or dimensions", async () => {
        const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Zawadiya",
        },
        {
            headers: {
                'authorization': `Bearer ${token}`
            }
        }
    )

        expect(spaceRes.status).toBe(400);
    })

    test("deleting a space that belongs to users", async () => {
        const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Zawadiya",
            dimensions: '100x200',
        },
        {
            headers: {
                'authorization': `Bearer ${token}`
            }
        }
    )

        
        const spaceDeleteRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${spaceRes.data.spaceId}`,
            {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            }
        )
        expect(spaceDeleteRes.status).toBe(200);
    })

    test("deleting a space that doesn't exists", async () => {
        const spaceRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${Math.random()}`,
        {
            headers: {
                'authorization': `Bearer ${token}`
            }
        });
        expect(spaceRes.status).toBe(400);
    })
    
    test("deleting a space that doesn't belong to a user", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            'name': 'lawdiya',
            dimensions: '100x200'
        },
        {
            headers: {
                'authorization': `Bearer ${token}`
            }
        })

        const spacedelete = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
        {
            headers: {
                'authorization': `Bearer ${adminToken}`
            }
        })

        expect(spacedelete.status).toBe(403);
    })

    test("Fetch all my spaces", async () => {
        const spaceListResp = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                'authorization': `Bearer ${adminToken}`
            }
        })
        
        expect(spaceListResp.data.spaces.length).toBe(0)
    })

    test("Admin has no spaces initially", async () => {
        const createSpaceResp = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "yed",
            dimensions: '100x200',
            mapId
        },{
            headers: {
                'authorization': `Bearer ${adminToken}`
            }
        })

        const spaceList2esp = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                'authorization': `Bearer ${adminToken}`
            }
        })

        expect(spaceList2esp.data.spaces.length).toBe(1);
        expect(spaceList2esp.data.spaces.filter(x => x.id === createSpaceResp.data.id)).toBeDefined();

    })

})

describe("Arena endpoints", () => {
    let adminId, adminToken, element1Id, element2Id, mapId, userId, token,
    spaceId ;
    beforeAll(async () => {
        const username = `dishank-${Math.random()}`;
        const password = "dishank" + Math.random();
        const adminSignup = axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: 'admin'
        });
        adminId = (await adminSignup).data.userId;

        const adminUser = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });
        adminToken = adminUser.data.token;

        const username1 = `dishank-${Math.random()}`;
        const userSignup = axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username1,
            password,
            type: 'user'
        });
        userId = (await userSignup).data.userId;

        const user = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username1,
            password
        });
        token = user.data.token;

        const element1Res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            });

        const element2Res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            });
    
        element1Id = await element1Res.data.id;
        element2Id = await element2Res.data.id;
        
        const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,
            {
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": [{
                        elementId: element1Id,
                        x: 20,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 18,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 19,
                        y: 20
                    }
                ]
             },
             {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
             })

        mapId = mapRes.data.id;

        const spaceResponse  = await axios.post(`${BACKEND_URL}/api/v1/space`, {
                name: "zaw",
                mapId: mapId,
                dimensions: "100x200",
            }, {
                headers : {
                    authorization: `Bearer ${token}`
                }
            })
        
        spaceId = spaceResponse.data.spaceId;
    });
    
    test("Incorrect space id returns error ", async () => {
        
        const response = axios.get(`${BACKEND_URL}/api/v1/space/123222`, {
            headers : {
                authorization: `Bearer ${token}`
            }
        });
        expect((await response).status).toBe(400)
    })

    test("correct space id returns space ", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers : {
                authorization: `Bearer ${token}`
            }
        });
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3);
    })

    test("Delete the element from space", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        const elementId = response.data.elements[0].id;
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element/${elementId}`,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        expect(deleteResponse.status).toBe(200);

        const spaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        expect(spaceResponse.data.elements.length).toBe(response.data.elements.length - 1);
    })

    test("add element to my space", async () => {
        const getSpaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        expect(getSpaceResponse.status).toBe(200)
        expect(getSpaceResponse.data.elements).toBeDefined()

        const elementLen = getSpaceResponse.data.elements.length;
        
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            elementId: element1Id,
            spaceId,
            x: 50,
            y: 30
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        
        expect(addElementResponse.status).toBe(200);

        const spaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        expect(spaceResponse.data.elements.length).toBe(elementLen + 1);
    })

    test("Error on adding element to out of bounds", async () => {

        const spaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        const addELEResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            elementId: element1Id,
            spaceId,
            x: parseInt(spaceResponse.data.dimensions.split("x")[1]) + 1,
            y: 30
        }, {
            headers: {
                authorization: `Bearer ${token}`
            } 
        })

        expect(addELEResponse.status).toBe(400);

    })

    test("Error on adding element on top of another element", async () => {

        const spaceResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        
        const addELEResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            elementId: element1Id,
            spaceId,
            x: spaceResponse.data.elements[0].x,
            y: 30
        },{
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    )

        expect(addELEResponse.status).toBe(400);
        
    })
    


})

describe("Admin endpoints", () => {
    let adminId, adminToken, userId, token
    beforeAll(async () => {
        const username = `dishank-${Math.random()}`;
        const password = "dishank" + Math.random();
        const signUpRes = axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password,
            type: 'admin'
        });
        adminId = (await signUpRes).data.userId;

        const userRes = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });
        adminToken = userRes.data.token;

        const username1 = `dishank-${Math.random()}`;
        const signUpRes1 = axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username1,
            password,
            type: 'user'
        });
        userId = (await signUpRes1).data.userId;

        const userRes1 = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username1,
            password
        });
        token = userRes1.data.token;

        const element1Res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            });

        const element2Res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            });
    
        element1Id = await element1Res.data.id;
        element2Id = await element2Res.data.id;
        
        const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,
            {
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": [{
                        elementId: element1Id,
                        x: 20,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 18,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 19,
                        y: 20
                    }
                ]
             },
             {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
             })

        mapId = mapRes.data.id;

        const spaceResponse  = await axios.post(`${BACKEND_URL}/api/v1/space`, {
                name: "zaw",
                mapId: mapId,
                dimensions: "100x200",
            }, {
                headers : {
                    authorization: `Bearer ${token}`
                }
            })
        
        spaceId = spaceResponse.data.spaceId;

    });

    test("user shouldn't be able to access admin endpoints", async () => {

        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            });

            const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,
                {
                    "thumbnail": "https://thumbnail.com/a.png",
                    "dimensions": "100x200",
                    "name": "100 person interview room",
                    "defaultElements": [{
                            elementId: element1Id,
                            x: 20,
                            y: 20
                        }, {
                          elementId: element2Id,
                            x: 18,
                            y: 20
                        }, {
                          elementId: element2Id,
                            x: 19,
                            y: 20
                        }
                    ]
                 },
                 {
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                 })

            const avatarRes = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,
                {
                    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                    "name": "Timmy"
                },
                {
                headers: {
                    'authorization': `Bearer ${token}`
                }
                })

            
            const createElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
              "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
            })

            const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${createElementResponse.data.id}`,
                {
                    "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"	
                },
                {
                headers: {
                    'authorization': `Bearer ${token}`
                }
                })


            
            expect(mapRes.status).toBe(403);
            expect(avatarRes.status).toBe(403);
            expect(addElementResponse.status).toBe(403);
            expect(updateElementResponse.status).toBe(403);
    })

    test("Admin is able to create element", async () => {

        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
                "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
            },
            {
                headers: {
                    'authorization': `Bearer ${adminToken }`
                }
            });

            const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,
                {
                    "thumbnail": "https://thumbnail.com/a.png",
                    "dimensions": "100x200",
                    "name": "100 person interview room",
                    "defaultElements": [{
                            elementId: element1Id,
                            x: 20,
                            y: 20
                        }, {
                          elementId: element2Id,
                            x: 18,
                            y: 20
                        }, {
                          elementId: element2Id,
                            x: 19,
                            y: 20
                        }
                    ]
                 },
                 {
                    headers: {
                        'authorization': `Bearer ${adminToken}`
                    }
                 })

            const avatarRes = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,
                {
                    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                    "name": "Timmy"
                },
                {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
                })

            const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${addElementResponse.data.id}`,
                {
                    "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"	
                },
                {
                headers: {
                    'authorization': `Bearer ${adminToken}`
                }
                })


    
            expect(mapRes.status).toBe(200);
            expect(avatarRes.status).toBe(200);
            expect(addElementResponse.status).toBe(200);
            expect(updateElementResponse.status).toBe(200);
    })
});

// describe("WS Endpoints", () => {
//     let userId, adminId ,userToken, adminToken, mapId, elementId, spaceId, adminX, adminY, userX, userY;
//     let ws1, ws2, ws1Messages = [], ws2Messages = [];

//     async function httpSetup(){
//         const username1 = "dishank" + Math.random(), password = Math.random();

//         const userSignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/singup`,{
//             username: username1,
//             password: password,
//             type: 'user'
//         })

//         const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/singin`, {
//             username: username1,
//             password
//         })

//         userToken = userSigninResponse.data.token;
//         userId = userSignUpResponse.data.userId;

//         let username2 = 'dishank' + Math.random();
//         const adminSignUpResponse = await axios.post(`${BACKEND_URL}/api/v1/singup`,{
//             username: username2,
//             password: password,
//             type: 'admin'
//         })

//         const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/singin`, {
//             username: username2,
//             password
//         })

//         adminToken = adminSigninResponse.data.token;
//         userId = adminSignUpResponse.data.userId;
        
//         const element1Res = axios.post(`${BACKEND_URL}/api/v1/admin/element`,
//             {
//                 "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//                 "width": 1,
//                 "height": 1,
//                 "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
//             },
//             {
//                 headers: {
//                     'authorization': `Bearer ${adminToken}`
//                 }
//             });

//         const element2Res = axios.post(`${BACKEND_URL}/api/v1/admin/element`,
//             {
//                 "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//                 "width": 1,
//                 "height": 1,
//                 "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
//             },
//             {
//                 headers: {
//                     'authorization': `Bearer ${adminToken}`
//                 }
//             });
    
//         element1Id = await element1Res.data.id;
//         element2Id = await element2Res.data.id;
        
//         const mapRes = await axios(`${BACKEND_URL}/api/v1/admin/map`,
//             {
//                 "thumbnail": "https://thumbnail.com/a.png",
//                 "dimensions": "100x200",
//                 "name": "100 person interview room",
//                 "defaultElements": [{
//                         elementId: element1Id,
//                         x: 20,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 18,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }
//                 ]
//              },
//              {
//                 headers: {
//                     'authorization': `Bearer ${adminToken}`
//                 }
//              })

//         mapId = mapRes.data.id;

//         const spaceResponse  = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//                 name: "zaw",
//                 mapId: mapId,
//                 dimensions: "100x200",
//             }, {
//                 headers : {
//                     authorization: `Bearer ${token}`
//                 }
//             })
        
//         spaceId = spaceResponse.data.spaceId;
//     }

//     async function waitForAndpullLatestMessage(messagesArr) {
//         return new Promise(r => {
//             if(messagesArr.length > 0)
//                 return r(messagesArr.shift())

//            let interval = setInterval(() => {
//                 if(messagesArr.length > 0){
//                     clearInterval(interval)
//                     r(messagesArr.shift())
//                 }
//             }, 1000);
//         })
//     }

//     async function setupWS(){
//         ws1 = new WebSocket(WS_URL)
//         ws2 = new WebSocket(WS_URL)
        
//         await new Promise(r => {
//            ws1.onopen = r 
//         })

//         await new Promise(r => {
//             ws2.onopen = r 
//          })

//          ws1.onmessage = (e) => {
//             ws1Messages.push(JSON.parse(e.data));
//          }

//          ws2.onmessage = (e) => {
//             ws2Messages.push(JSON.parse(e.data))
//          }

//     }

//     beforeAll(async () => {
//         await httpSetup();
//         await setupWS();
//     })

//     test("receiving ack from server when user joins", async () => {
//         ws1.send(JSON.stringify({
//             "type": "join",
//             "payload": {
//                 "spaceId": spaceId,
//                 token: adminToken
//             }
//         }))

//         let message1 = await waitForAndpullLatestMessage(ws1Messages);

//         ws2.send(JSON.stringify({
//             "type": "join",
//             "payload": {
//                 "spaceId": spaceId,
//                 token: userToken
//             }
//         }))

//         let message2 = await waitForAndpullLatestMessage(ws2Messages);
//         let message3 = await waitForAndpullLatestMessage(ws1Messages); //message received from server to 1 when 2 join the room

//         expect(message1).toBeDefined();
//         expect(message1.type).toBe("space-joined")
//         expect(message1.payload.users.length).toBe(0);
//         adminX = message1.payload.spwan.x
//         adminY = message1.payload.spwan.y

//         expect(message2).toBeDefined();
//         expect(message2.type).toBe("space-joined")
//         expect(message2.users.length).toBe(1);
//         userX = message2.payload.spwan.x;
//         userY = message2.payload.spwan.y;

//         expect(message3).toBeDefined();
//         expect(message3.type).toBe("space-joined")
//         expect(message3.payload.users.length).toBe(1);
//         expect(message3.payload.x).toBe(userX);
//         expect(message3.payload.y).toBe(userY);

//     })

//     test("user shouldn't be able to move outside of the boundry", () => {
//         ws1.send(JSON.stringify(
//             {
//                 type: "move", 
//                 x: 1000000,
//                 y: 9000
//             }
//         ))

//         const message = waitForAndpullLatestMessage(ws1Messages);

//         expect(message.type).toBe("movement-rejected")
//         expect(message.payload.x).toBe(adminX);
//         expect(message.payload.y).toBe(adminY);
//     })

//     test("user shouldn't be able to move 2 block at once", () => {
//         ws1.send(JSON.stringify(
//             {
//                 type: "move", 
//                 x: adminX + 2,
//                 y: adminY
//             }
//         ))

//         const message = waitForAndpullLatestMessage(ws1Messages);

//         expect(message.type).toBe("movement-rejected")
//         expect(message.payload.x).toBe(adminX);
//         expect(message.payload.y).toBe(adminY);
//     })

//     test("user should be able to move within the boundry and brodcast the message", () => {
//         ws1.send(JSON.stringify(
//             {
//                 type: "move", 
//                 x: adminX + 1,
//                 y: adminY
//             }
//         ))

//         const message = waitForAndpullLatestMessage(ws2Messages);
        

//         expect(message.type).toBe("movement")
//         expect(message.payload.x).toBe(adminX + 1)
//         expect(message.payload.y).toBe(adminY)
//         expect(message.payload.userId).toBe(adminId)
//     })

//     test("id a user leaves otheer users receives a leave event", () => {
//         ws1.close();
//         let message  = waitForAndpullLatestMessage(ws2Messages);
//         expect(message.type).toBe("user-left")
//         expect(message.payload.userId).toBe(adminId);
//     })
// })