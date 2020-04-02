def getFileNumber(fileName)
	parts = fileName.split('_')
	return parts[parts.length-1].split('.')[0];
end

source      = ARGV[0]
destination = ARGV[1]

direction = 0
command = "convert \\("
betterSourceA = source.split("lordgoo/")
betterSource = "/c/Users/lordgoo/"+betterSourceA[1]
betterDestA = destination.split("lordgoo/")
betterDest = "/c/Users/lordgoo/"+betterDestA[1]
print "HEY"+source+"\n\n"
print "betterSource"+betterSource+"\n\n";
print "betterDest"+betterDest+"\n\n";
images = Dir.entries(source).sort
images.each do |imageFile|
	next if imageFile == '.' or imageFile == '..'

	fileNumber = getFileNumber(imageFile)
	if (fileNumber[0].to_i > direction)
		direction += 1
		command.concat(" +append \\) \\(")
	end
	command.concat(" #{betterSource}#{imageFile} ")
end

command.concat(" +append \\) -background none -append ")
command.concat(betterDest)
print command+"\n"
system(command)