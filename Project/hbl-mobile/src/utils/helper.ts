// Helper function to extract profile picture URL
const getProfileImageUrl = (profilePicture: any): string | null => {
  if (typeof profilePicture === 'string') {
    return profilePicture;
  }
  if (profilePicture && typeof profilePicture === 'object' && 'url' in profilePicture) {
    return profilePicture.url;
  }
  return null;
};

export { getProfileImageUrl };
