function getFilteredData(transfers, addresses, filter) {
  const results = {};
  addresses.forEach((address) => {
    results[address.toLowerCase()] = transfers.filter(
      (transfer) => transfer[filter]?.toLowerCase() === address.toLowerCase()
    );
  });
  return results;
}

function getInvolvedAddresses(logs) {
  const addresses = logs.reduce((acc, log) => {
    if (log.triggered_by) {
      console.log({ logAddress: log.triggered_by });
      acc.push(...log.triggered_by);
    }
    return acc;
  }, []);
  // Use a Set to ensure all addresses are unique
  return [...new Set(addresses)];
}

function shortenAddress(address) {
  if (
    typeof address !== "string" ||
    !address.startsWith("0x") ||
    address.length !== 42
  ) {
    throw new Error("Invalid Ethereum address");
  }
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  return `${start}...${end}`;
}

function isValidData(data, addressKey) {
  return (
    data.length === 1 &&
    data[0].tokenName &&
    data[0].value &&
    data[0][addressKey] !== null &&
    data[0][addressKey] !== "0x0000000000000000000000000000000000000000"
  );
}

export { isValidData, shortenAddress, getInvolvedAddresses, getFilteredData };
