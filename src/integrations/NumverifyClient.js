class NumverifyClient {

  async validate(numero){
    
  //conexão com api externa
    const url =
    `http://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_KEY}&number=${numero}`;

    const response = await fetch(url);

    return await response.json();

  }

}

export default new NumverifyClient();