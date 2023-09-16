import json
import tempfile
from ytmusicapi import YTMusic

import sys
json_data = json.loads(sys.argv[1])
func = sys.argv[2]

with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_file:
    json.dump(json_data, temp_file)
    temp_file.flush()
    temp_file_path = temp_file.name

# Create YTMusic instance
ytmusic = YTMusic(temp_file_path)

if hasattr(ytmusic, func):
    selected_function = getattr(ytmusic, func)
    result = selected_function()
    # dict to json
    result = json.dumps(result)
    print(result)
else:
    print(f"Function '{func}' not found in YTMusic class")

# Remove the temporary file
temp_file.close()
