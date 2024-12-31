def simple_hash(input_string):
    hash_value = 0
    for i, char in enumerate(input_string):
        ascii_value = ord(char)        
        hash_value = (hash_value * 31 + ascii_value) % (2**32)    
    return hex(hash_value)

input_string = "Hello, World!"
hashed_value = simple_hash(input_string)
print(f"Hash of '{input_string}' is {hashed_value}")
