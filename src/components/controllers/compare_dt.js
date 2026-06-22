const compare = (receiver_dt, provider_dt) => {
    const receiverDate = new Date(receiver_dt);
    const providerDate = new Date(provider_dt)
    return providerDate >= receiverDate;
}

const providerMatchingForClient = (client_d, pro_from, pro_to) => {
    //const rDate = new Date(re.y, re.m, re.d, re.hour, re.min);
    const client = new Date(client_d)
    const pFromDate = new Date(pro_from);
    const pToDate = new Date(pro_to);
    return client >= pFromDate && client < pToDate;
}
export default { compare, providerMatchingForClient }