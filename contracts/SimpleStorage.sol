pragma solidity >=0.4.21 <0.7.0;


contract SimpleStorage {
    string ipsfHash;

    function set(string memory x) public {
        ipsfHash = x;
    }

    function get() public view returns (string memory) {
        return ipsfHash;
    }
}
